/**
 * The discography. Copy comes from the current site; `format` and `side` are the record
 * framing. `metrics` are TODO(hitarth) and render only when filled in.
 */
export type Project = {
  slug: string;
  name: string;
  format: string;
  status: string;
  side: "A" | "B";
  track: string;
  blurb: string;
  tech: string[];
  links: { label: string; href: string }[];
  /** Which mini-visual the record plays. */
  visual: "extract" | "eval" | "gauge" | "grid" | "ledger";
  /** Live stats keys (see lib/stats.ts). */
  stats?: { pypi?: string; github?: string };
  metrics: { label: string; value: string | null }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "confident-extract",
    name: "confident-extract",
    format: "LP",
    status: "Released on PyPI",
    side: "A",
    track: "A1",
    blurb: "Open-source Python library for deterministic, schema-constrained structured extraction, built on msgspec for low-overhead validation.",
    tech: ["Python", "msgspec", "Structured outputs", "Schema validation"],
    links: [{ label: "PyPI", href: "https://pypi.org/project/confident-extract/" }],
    visual: "extract",
    stats: { pypi: "confident-extract", github: "hitarthbuilds/confident-extract" },
    metrics: [],
  },
  {
    slug: "promptcrucible",
    name: "promptcrucible",
    format: "In the studio",
    status: "In active development",
    side: "A",
    track: "A2",
    blurb: "A multi-agent prompt-optimization workbench for systematically testing and improving prompts against eval harnesses.",
    tech: ["Multi-agent systems", "Eval harnesses", "LLM evaluation"],
    links: [],
    visual: "eval",
    stats: { github: "hitarthbuilds/promptcrucible" },
    metrics: [],
  },
  {
    slug: "answerrank-ai",
    name: "AnswerRank AI",
    format: "EP",
    status: "Diagnostic tool",
    side: "B",
    track: "B1",
    blurb: "AEO diagnostic tool (Gemini + Firecrawl) that scores how discoverable a page is to AI answer engines.",
    tech: ["Gemini", "Firecrawl", "Answer-engine optimization"],
    links: [],
    visual: "gauge",
    metrics: [],
  },
  {
    slug: "autodataset-lab",
    name: "AutoDataset Lab",
    format: "Debut",
    status: "First venture",
    side: "B",
    track: "B2",
    blurb: "A dataset-intelligence platform for inspecting, profiling and cleaning ML training data.",
    tech: ["Dataset profiling", "Data cleaning", "ML training data"],
    links: [],
    visual: "grid",
    metrics: [],
  },
  {
    slug: "seerflow",
    name: "SeerFlow",
    format: "Now recording",
    status: "Currently building",
    side: "B",
    track: "B3",
    blurb: "AI treasury and cash-flow intelligence for Indian D2C brands, where AI explains and a deterministic backend owns the financial truth.",
    tech: ["Deterministic services", "Numeric guardrails", "LLM explanations"],
    links: [{ label: "seerflow.in", href: "https://seerflow.in" }],
    visual: "ledger",
    metrics: [],
  },
];
