/**
 * Field notes featured on the homepage, each with its editorial still.
 * Titles, dates and reading times come from the posts themselves.
 */
export const FEATURED_NOTES = [
  { slug: "dead-letter-queues-llm-extraction-pipelines", label: "Dead-letter queues for LLM extraction failures", art: "/media/lower/dead-letter.webp" },
  { slug: "constrained-decoding-vs-post-hoc-validation-llm-extraction", label: "Constrained decoding vs post-hoc validation", art: "/media/lower/constrained-decoding.webp" },
  { slug: "ai-explains-backend-computes-seerflow", label: "AI explains, backend computes", art: "/media/lower/backend-computes.webp" },
] as const;
