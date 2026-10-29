import { test } from "node:test";
import assert from "node:assert/strict";
import { extract, SAMPLE } from "../mock-extract";

const get = (r: ReturnType<typeof extract>, k: string) => r.fields.find((f) => f.key === k)!;

test("sample invoice extracts every field and validates", () => {
  const r = extract(SAMPLE);
  assert.equal(r.valid, true);
  assert.equal(get(r, "invoice_id").value, "NW-2026-0417");
  assert.equal(get(r, "total").value, "1208.50");
  assert.equal(get(r, "currency").value, "USD");
  assert.equal(get(r, "due").value, "2026-11-14");
  assert.equal(get(r, "vendor").value, "Northwind Logistics Pvt Ltd");
  assert.equal(get(r, "po_ref").value, "88-1123");
});

test("post-hoc mode catches the lookalike at validate and repairs it", () => {
  const r = extract(SAMPLE, "posthoc");
  const total = get(r, "total");
  assert.equal(total.status, "repaired");
  assert.equal(total.caughtBy, "repair");
  assert.ok(r.trace.some((t) => t.stage === "validate" && t.msg.includes("1,2O8.50")));
});

test("constrained mode masks the lookalike before validation", () => {
  const r = extract(SAMPLE, "constrained");
  assert.equal(get(r, "total").caughtBy, "constrain");
  assert.ok(!r.trace.some((t) => t.stage === "repair"));
});

test("missing required fields invalidate; optional po_ref does not", () => {
  const r = extract("Invoice no: AB-1234\ntotal: ₹5,000\ndue 2026-01-31\nvendor: Acme");
  assert.equal(r.valid, true);
  assert.equal(get(r, "currency").value, "INR");
  assert.equal(get(r, "po_ref").value, null);
  const bad = extract("hello there");
  assert.equal(bad.valid, false);
});
