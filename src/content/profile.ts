/** Name, links and short copy used across the site, metadata and structured data. */
export const PROFILE = {
  name: "Hitarth Desai",
  title: "AI Systems Engineer",
  url: "https://hitarthdesai.com",
  location: { city: "Surat", region: "Gujarat", country: "India", countryCode: "IN" },
  description:
    "Hitarth Desai builds production AI infrastructure, document intelligence and data systems. Explore engineering projects, client work, and field notes.",
  linkedin: "https://www.linkedin.com/in/hitarth-desai10/",
  github: "https://github.com/hitarthbuilds",
  /** Every profile that should resolve to the same person in search (schema.org sameAs). */
  sameAs: [
    "https://github.com/hitarthbuilds",
    "https://www.linkedin.com/in/hitarth-desai10",
    "https://huggingface.co/hitarthbuilds",
    "https://x.com/hitarthbuilds",
    "https://pypi.org/user/hitarth_builds_10/",
  ],
} as const;
