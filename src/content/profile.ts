/**
 * Single source of truth for every piece of copy and every link on the site.
 * Fields typed `string | null` are TODOs waiting on Hitarth's input: components must
 * hide them (or render a neutral "—") when they are null, never show placeholder text.
 */

export type Social = { id: "github" | "huggingface" | "linkedin" | "x" | "pypi"; label: string; handle: string; href: string };

export type Role = {
  title: string;
  org: string;
  summary: string;
  current?: boolean;
  /** TODO(hitarth): e.g. "2025 — now". Hidden while null. */
  dates: string | null;
};

export const PROFILE = {
  name: "Hitarth Desai",
  shortName: "Hitarth",
  monogram: "HD",
  title: "AI Systems Engineer",
  location: { city: "Surat", region: "Gujarat", country: "India", countryCode: "IN" },
  url: "https://hitarthdesai.com",

  tagline: "I build the layer that makes LLMs reliable in production.",
  /** Hero headline, split into display lines. `accent` renders in molten serif italic. */
  headline: [
    [{ text: "I forge the layer" }],
    [{ text: "that makes LLMs" }],
    [{ text: "reliable", accent: true }, { text: " in" }],
    [{ text: "production." }],
  ] as { text: string; accent?: boolean }[][],
  motto: "Forged, not demoed",

  status: {
    open: true,
    label: "Open to AI Systems & Founding Engineer roles at seed–Series A startups",
  },

  bio: "Currently at InfraDock AI, designing LLM-powered document-processing pipelines. Focused on the gap between models that demo well and systems that survive real traffic: schema-constrained extraction, async and batched pipelines, and observability. Publishes the tools he needed but couldn't find.",
  intro:
    "AI Systems Engineer at InfraDock AI. I close the gap between models that demo well and systems that survive real traffic: schema-constrained extraction, async and batched pipelines, observability.",

  /** TODO(hitarth): the current site lists no email; the contact section needs one. */
  email: null as string | null,
  /** TODO(hitarth): booking link (Cal.com / Calendly). Hidden while null. */
  bookingUrl: null as string | null,

  socials: [
    { id: "github", label: "GitHub", handle: "hitarthbuilds", href: "https://github.com/hitarthbuilds" },
    { id: "huggingface", label: "Hugging Face", handle: "hitarthbuilds", href: "https://huggingface.co/hitarthbuilds" },
    { id: "linkedin", label: "LinkedIn", handle: "hitarth-desai10", href: "https://www.linkedin.com/in/hitarth-desai10" },
    { id: "x", label: "X", handle: "@hitarthbuilds", href: "https://x.com/hitarthbuilds" },
    { id: "pypi", label: "PyPI", handle: "hitarth_builds_10", href: "https://pypi.org/user/hitarth_builds_10/" },
  ] satisfies Social[],

  experience: [
    {
      title: "AI Systems Engineer",
      org: "InfraDock AI",
      summary: "Designing LLM-powered document-processing pipelines.",
      current: true,
      dates: null,
    },
    {
      title: "AI/ML Lead (2 terms)",
      org: "GDSC Surat",
      summary: "Taught and built with a few hundred student engineers over two terms.",
      dates: null,
    },
    {
      title: "Backend & systems",
      org: "Independent / contract",
      summary: "Event-driven backtesting infrastructure and microservice platforms.",
      dates: null,
    },
  ] satisfies Role[],

  education: { degree: "B.E. Computer Engineering", school: "Gujarat Technological University", short: "GTU", year: "2026" },

  stack: {
    Languages: ["Python", "TypeScript", "Rust (learning)"],
    "LLM & data": ["Structured outputs", "Constrained decoding", "msgspec", "LangChain", "vLLM"],
    Infra: ["Docker", "Kubernetes", "Terraform", "Kafka", "Microservices"],
    MLOps: ["Async pipelines", "Batching", "Eval harnesses", "Observability"],
  } as Record<string, string[]>,

  achievements: [
    "International gold-medal powerlifter",
    "Two terms as AI/ML Lead at GDSC Surat",
    "Open-source tools on PyPI and GitHub",
  ],

  /** TODO(hitarth): competition details. Each stat is hidden while null. */
  powerlifting: {
    meet: null as string | null,
    year: null as string | null,
    weightClass: null as string | null,
    bestTotal: null as string | null,
    yearsLifting: null as string | null,
  },
} as const;
