/**
 * Deterministic, regex-based stand-in for an LLM extractor (no API calls). It mirrors the two
 * strategies from "Constrained Decoding vs Post-hoc Validation": constrained decoding masks
 * invalid tokens while the value is produced; post-hoc validation lets them through, catches
 * them against the schema, then repairs.
 */

export type Mode = "constrained" | "posthoc";
export type Stage = "tokenize" | "constrain" | "validate" | "repair";
export type FieldStatus = "ok" | "repaired" | "missing";

export type Field = {
  key: string;
  type: string;
  value: string | null;
  /** The exact text the value came from, when found. */
  raw: string | null;
  status: FieldStatus;
  /** Which pedal acted on this field, and what it did. */
  caughtBy?: Stage;
  note?: string;
};

export type Extraction = { fields: Field[]; valid: boolean; trace: { stage: Stage; msg: string }[] };

export const SCHEMA = [
  { key: "invoice_id", type: "str" },
  { key: "total", type: "Decimal" },
  { key: "currency", type: 'Literal["USD", "INR", "EUR"]' },
  { key: "due", type: "date" },
  { key: "vendor", type: "str" },
  { key: "po_ref", type: "str | None" },
] as const;

export const SAMPLE = `From: billing@northwind-logistics.co
Subj: RE: RE: invoice ?? pls confirm

hey, attaching the inv for last month.
Invoice no: NW-2026-0417 (supersedes 0412)
amount due is $1,2O8.50 incl. tax
due by 14th Nov 2026, net 30
vendor: Northwind Logistics Pvt Ltd
PO ref 88-1123 // ping accounts if wrong`;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const CURRENCY: Record<string, string> = { $: "USD", "₹": "INR", "€": "EUR", usd: "USD", inr: "INR", eur: "EUR", rs: "INR" };

/** Characters OCR and models commonly swap into numbers, and what they should have been. */
const LOOKALIKES: Record<string, string> = { O: "0", o: "0", l: "1", I: "1", S: "5", B: "8" };

const pad = (n: number) => String(n).padStart(2, "0");

function parseDate(s: string): string | null {
  let m = /(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  m = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3,9})\.?,?\s+(\d{4})/i.exec(s);
  if (m) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) return `${m[3]}-${pad(mi + 1)}-${pad(+m[1])}`;
  }
  m = /([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i.exec(s);
  if (m) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (mi >= 0) return `${m[3]}-${pad(mi + 1)}-${pad(+m[2])}`;
  }
  m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);
  if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  return null;
}

export function extract(text: string, mode: Mode = "posthoc"): Extraction {
  const trace: Extraction["trace"] = [];
  const fields: Field[] = [];
  const lines = text.split(/\r?\n/);
  trace.push({ stage: "tokenize", msg: `${text.split(/\s+/).filter(Boolean).length} tokens, ${lines.length} lines` });

  const id = /invoice\s*(?:no\.?|number|#|id)?\s*[:#]?\s*([A-Z]{1,4}[-/]?\d{2,4}(?:[-/]\d{2,6})?)/i.exec(text);
  fields.push({ key: "invoice_id", type: "str", value: id ? id[1] : null, raw: id ? id[1] : null, status: id ? "ok" : "missing" });

  const tot = /(?:amount\s+due|total|balance\s+due|amount)\D{0,24}?(\$|₹|€|usd|inr|eur|rs\.?)\s*([\dOolISB][\d,OolISB]*(?:\.\d{1,2})?)/i.exec(text);
  let currency: string | null = null;
  if (tot) {
    currency = CURRENCY[tot[1].replace(".", "").toLowerCase()] ?? CURRENCY[tot[1]] ?? null;
    const raw = tot[2];
    const bad = [...raw].filter((c) => c in LOOKALIKES);
    const fixed = raw.replace(/[OolISB]/g, (c) => LOOKALIKES[c]).replace(/,/g, "");
    const value = Number.isFinite(Number(fixed)) ? Number(fixed).toFixed(2) : null;
    if (!bad.length) fields.push({ key: "total", type: "Decimal", value, raw, status: value ? "ok" : "missing" });
    else if (mode === "constrained") {
      const msg = `masked ${bad.map((c) => `'${c}'`).join(", ")}: not a digit in a Decimal field`;
      fields.push({ key: "total", type: "Decimal", value, raw, status: "repaired", caughtBy: "constrain", note: msg });
      trace.push({ stage: "constrain", msg: `total: ${msg}` });
    } else {
      fields.push({ key: "total", type: "Decimal", value, raw, status: "repaired", caughtBy: "repair", note: `${bad.map((c) => `${c}→${LOOKALIKES[c]}`).join(", ")}` });
      trace.push({ stage: "validate", msg: `total: invalid Decimal literal '${raw}'` });
      trace.push({ stage: "repair", msg: `total: ${bad.map((c) => `${c}→${LOOKALIKES[c]}`).join(", ")}, revalidated` });
    }
  } else fields.push({ key: "total", type: "Decimal", value: null, raw: null, status: "missing" });

  fields.push({ key: "currency", type: "Literal", value: currency, raw: tot ? tot[1] : null, status: currency ? "ok" : "missing" });

  const dueLine = lines.find((l) => /\bdue\b/i.test(l) && parseDate(l)) ?? null;
  const due = dueLine ? parseDate(dueLine) : null;
  const dueRaw = dueLine ? (/(\d{1,2}(?:st|nd|rd|th)?\s+[a-z]{3,9}\.?,?\s+\d{4}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{4}|[a-z]{3,9}\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})/i.exec(dueLine)?.[1] ?? null) : null;
  fields.push({ key: "due", type: "date", value: due, raw: dueRaw, status: due ? "ok" : "missing" });

  const vendor = /vendor\s*[:\-]\s*([^\n/]+?)\s*$/im.exec(text);
  fields.push({ key: "vendor", type: "str", value: vendor ? vendor[1].trim() : null, raw: vendor ? vendor[1].trim() : null, status: vendor ? "ok" : "missing" });

  const po = /\bP\.?O\.?\s*(?:ref|no\.?|number|#)?\s*[:#]?\s*([A-Z0-9][\w-]{2,})/i.exec(text);
  fields.push({ key: "po_ref", type: "str | None", value: po ? po[1] : null, raw: po ? po[1] : null, status: po ? "ok" : "missing" });

  // po_ref is optional; everything else is required by the schema.
  const missing = fields.filter((f) => f.status === "missing" && f.key !== "po_ref");
  for (const f of missing) trace.push({ stage: "validate", msg: `${f.key}: required field missing` });
  if (!missing.length) trace.push({ stage: "validate", msg: "schema valid" });
  return { fields, valid: missing.length === 0, trace };
}

export function toJson(fields: Field[]) {
  return fields.map((f) => [f.key, f.value === null ? null : f.key === "total" ? Number(f.value) : f.value] as const);
}
