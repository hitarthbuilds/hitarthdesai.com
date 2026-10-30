"use client";

import { PROFILE } from "@/content/profile";
import { PROJECTS } from "@/content/projects";

/**
 * Builds an ATS-friendly résumé PDF on-device from profile.ts (jsPDF is loaded on demand), so it
 * always matches the site. Real text throughout (selectable, parseable); one steel header band
 * and a forge-orange rule are the only decoration.
 */

/** jsPDF's built-in Helvetica covers WinAnsi only: map the few characters it can't draw. */
const safe = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/→/g, "->").replace(/…/g, "...").replace(/[^\x00-\xFF–—•·×]/g, "");

export async function buildResume() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: `${PROFILE.name}: Résumé`, author: PROFILE.name, subject: PROFILE.title, keywords: "AI Systems Engineer, LLM, structured outputs" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const M = 48, CW = W - M * 2;
  let y = 0;

  // Steel header band + forge rule.
  doc.setFillColor(23, 26, 31);
  doc.rect(0, 0, W, 112, "F");
  doc.setFillColor(255, 106, 26);
  doc.rect(0, 112, W, 4, "F");
  doc.setTextColor(233, 237, 242);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(PROFILE.name, M, 54);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(255, 181, 71);
  doc.text(`${PROFILE.title} · ${PROFILE.location.city}, ${PROFILE.location.region}, ${PROFILE.location.country}`, M, 76);
  doc.setTextColor(154, 161, 171);
  doc.setFontSize(9);
  const contact = [PROFILE.email, PROFILE.url.replace("https://", ""), ...PROFILE.socials.filter((s) => s.id !== "x").map((s) => s.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))].filter(Boolean).join("  ·  ");
  doc.text(safe(contact), M, 96, { maxWidth: CW });
  y = 146;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const heading = (t: string) => {
    ensure(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(194, 65, 12);
    doc.text(t.toUpperCase(), M, y);
    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(0.6);
    doc.line(M, y + 6, W - M, y + 6);
    y += 19;
  };
  const para = (t: string, size = 9.6, color: [number, number, number] = [40, 44, 52], indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safe(t), CW - indent) as string[];
    ensure(lines.length * size * 1.32);
    doc.text(lines, M + indent, y);
    y += lines.length * size * 1.32;
  };
  const row = (left: string, right: string | null) => {
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 19, 23);
    doc.text(safe(left), M, y);
    if (right) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(106, 113, 124);
      doc.text(safe(right), W - M, y, { align: "right" });
    }
    y += 15;
  };

  heading("Summary");
  para(`${PROFILE.tagline} ${PROFILE.bio}`);
  para(PROFILE.status.label + ".", 9.6, [194, 65, 12]);
  y += 3;

  heading("Experience");
  for (const r of PROFILE.experience) {
    row(`${r.title} · ${r.org}`, r.dates ?? r.when);
    para(r.summary, 9.6, [60, 64, 72]);
    y += 3;
  }

  heading("Selected projects");
  for (const p of PROJECTS) {
    row(p.name, p.status);
    para(`${p.blurb} Stack: ${p.tech.join(", ")}.${p.links.length ? ` ${p.links.map((l) => l.href).join(" · ")}` : ""}`, 9.6, [60, 64, 72]);
    y += 3;
  }

  heading("Skills");
  for (const [group, items] of Object.entries(PROFILE.stack)) para(`${group}: ${items.join(", ")}`);
  y += 3;

  heading("Education");
  row(`${PROFILE.education.degree} · ${PROFILE.education.school}`, PROFILE.education.year);
  y += 3;

  heading("Achievements");
  for (const a of PROFILE.achievements) para(`•  ${a}`);

  // Footer on every page.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(154, 161, 171);
    doc.text(`Generated from ${PROFILE.url.replace("https://", "")} · always current`, M, H - 24);
    doc.text(`${i} / ${pages}`, W - M, H - 24, { align: "right" });
  }

  return doc;
}

export async function downloadResume() {
  (await buildResume()).save("Hitarth-Desai-Resume.pdf");
}
