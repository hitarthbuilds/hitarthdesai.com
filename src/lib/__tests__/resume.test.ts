import { test } from "node:test";
import assert from "node:assert/strict";
import { buildResume } from "../resume";
import { PROFILE } from "../../content/profile";
import { PROJECTS } from "../../content/projects";

test("résumé PDF carries real, selectable text that matches profile.ts", async () => {
  const doc = await buildResume();
  const raw = doc.output();
  assert.ok(raw.startsWith("%PDF-"), "is a PDF");
  for (const s of [PROFILE.name, PROFILE.title, "InfraDock AI", PROFILE.education.school, ...PROJECTS.map((p) => p.name)]) assert.ok(raw.includes(s), `contains "${s}"`);
  assert.equal(doc.getNumberOfPages(), 1, "fits on one page");
});
