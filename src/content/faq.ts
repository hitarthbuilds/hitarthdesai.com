/** Soundcheck: what founders actually ask. Answers are sourced from the current site's copy. */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is he best at?",
    a: "The reliability layer between a model that demos well and a system that survives production traffic: schema-constrained extraction, validation, batching and observability.",
  },
  {
    q: "How does he approach reliability?",
    a: "Turn probabilistic model output into something a downstream service can trust: constrain the output to a schema, validate it deterministically, route failures somewhere visible (dead-letter queues, human review) instead of retrying blindly, then make the whole path fast and observable enough to ship.",
  },
  {
    q: "What does he do right now?",
    a: "He is an AI Systems Engineer at InfraDock AI, designing LLM-powered document-processing pipelines, and he is building SeerFlow, an AI treasury and cash-flow intelligence platform for Indian D2C brands.",
  },
  {
    q: "What open-source tools has he built?",
    a: "confident-extract, a Python library for deterministic, schema-constrained extraction from LLMs built on msgspec, is published on PyPI. promptcrucible, a multi-agent prompt-optimization workbench, is in active development.",
  },
  {
    q: "Where is he based, and what timezone?",
    a: "Surat, Gujarat, India: IST (UTC+05:30).",
  },
  {
    q: "What roles is he open to?",
    a: "AI Systems and Founding Engineer roles at seed to Series A startups.",
  },
  {
    q: "What is his background?",
    a: "Computer Engineering at Gujarat Technological University (graduating 2026) and two terms as AI/ML Lead at GDSC Surat, where he taught and built alongside a few hundred student engineers.",
  },
];
