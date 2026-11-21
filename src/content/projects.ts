/**
 * The ten case studies, in index order. Copy comes from the 2026 portfolio handoff.
 * Client work uses real captures of the shipped sites; AI systems use the editorial stills.
 */
export type Project = {
  slug: string;
  name: string;
  category: "AI systems" | "Client work";
  field: string;
  description: string;
  image: string;
  /** "still" = editorial photograph, "screenshot" = capture of the live product (16:9, top-anchored). */
  imageKind: "still" | "screenshot";
  alt: string;
  focal: string;
  /** Long names get a smaller case-page title. */
  wideTitle: boolean;
  tools: string[];
  links: { label: string; href: string }[];
  notes: { title: string; body: string }[];
};

export const PROJECTS: Project[] = [
  {
    "slug": "seerflow",
    "name": "SeerFlow",
    "category": "AI systems",
    "field": "Cash-flow intelligence",
    "description": "A treasury workspace for D2C brands. The backend computes cash positions and reconciles payouts. AI explains what moved.",
    "image": "/work/live/seerflow.webp",
    "imageKind": "screenshot",
    "alt": "The SeerFlow homepage: “Know your true profit, not just sales,” beside a diagram linking Shopify, Cashfree, Meta Ads, Shiprocket, Google Ads and Razorpay.",
    "focal": "50% 0%",
    "wideTitle": false,
    "tools": [
      "Deterministic services",
      "Numeric guardrails",
      "LLM explanations"
    ],
    "links": [
      {
        "label": "Visit SeerFlow",
        "href": "https://seerflow.in/"
      },
      {
        "label": "Read the architecture note",
        "href": "/blog/ai-explains-backend-computes-seerflow"
      }
    ],
    "notes": [
      {
        "title": "Calculate the figures",
        "body": "D2C operators need to know which payouts, costs and expected receipts contribute to a cash position. SeerFlow keeps the calculations in backend services."
      },
      {
        "title": "Ground the explanation",
        "body": "The language model explains the figures those services return. A numeric guardrail checks that an amount in the explanation actually appears in the underlying data."
      }
    ]
  },
  {
    "slug": "confident-extract",
    "name": "confident-extract",
    "category": "AI systems",
    "field": "Structured extraction",
    "description": "An open-source Python library that turns model responses into schema-validated records using msgspec.",
    "image": "/media/work/confident-extract.webp",
    "imageKind": "still",
    "alt": "A charcoal paper insert lifts out of a precisely cut ivory frame.",
    "focal": "50% 50%",
    "wideTitle": true,
    "tools": [
      "Python",
      "msgspec",
      "Schema validation"
    ],
    "links": [
      {
        "label": "View package on PyPI",
        "href": "https://pypi.org/project/confident-extract/"
      },
      {
        "label": "Read the extraction note",
        "href": "/blog/constrained-decoding-vs-post-hoc-validation-llm-extraction"
      }
    ],
    "notes": [
      {
        "title": "Define the record",
        "body": "A Python schema specifies the fields and types an extraction should produce. An invoice identifier, a decimal amount and a due date each have a different contract."
      },
      {
        "title": "Validate the result",
        "body": "The library uses msgspec to check the structured output. This gives downstream Python code a defined boundary between a model response and a record it can use."
      }
    ]
  },
  {
    "slug": "promptcrucible",
    "name": "promptcrucible",
    "category": "AI systems",
    "field": "Prompt evaluation",
    "description": "A multi-agent workbench for running prompt variants against evaluation harnesses and comparing their results.",
    "image": "/media/work/promptcrucible.webp",
    "imageKind": "still",
    "alt": "Three white paper samples are folded into different test forms.",
    "focal": "50% 54%",
    "wideTitle": true,
    "tools": [
      "Multi-agent systems",
      "Evaluation harnesses",
      "LLM evaluation"
    ],
    "links": [
      {
        "label": "Read the evaluation note",
        "href": "/blog/synthetic-data-eval-sets-llm"
      }
    ],
    "notes": [
      {
        "title": "Compare prompt variants",
        "body": "Changing a prompt creates a new candidate. The workbench brings those candidates into one repeated evaluation process, so runs can be compared against the same task."
      },
      {
        "title": "Use evaluation as feedback",
        "body": "Agents use the harness to test and refine candidate prompts. The project is in active development."
      }
    ]
  },
  {
    "slug": "answerrank-ai",
    "name": "AnswerRank AI",
    "category": "AI systems",
    "field": "Search diagnostics",
    "description": "A diagnostic tool that uses Gemini and Firecrawl to score how discoverable a page is to AI answer engines.",
    "image": "/media/work/answerrank-ai.webp",
    "imageKind": "still",
    "alt": "A metal-rimmed magnifier isolates a light tab among dark index cards.",
    "focal": "52% 50%",
    "wideTitle": false,
    "tools": [
      "Gemini",
      "Firecrawl",
      "Answer-engine optimization"
    ],
    "links": [
      {
        "label": "Read the AI systems note",
        "href": "/blog/beyond-prompt-engineering-ai-systems-layer"
      }
    ],
    "notes": [
      {
        "title": "Inspect a page",
        "body": "AnswerRank AI takes a page as the unit of analysis. Firecrawl supplies the page content used in the diagnostic."
      },
      {
        "title": "Assess discoverability",
        "body": "The evaluation uses Gemini to produce a score for how accessible that page is to AI answer engines. The score describes the page being assessed."
      }
    ]
  },
  {
    "slug": "autodataset-lab",
    "name": "AutoDataset Lab",
    "category": "AI systems",
    "field": "Dataset intelligence",
    "description": "An inspection and cleaning workspace for profiling machine-learning datasets and surfacing data-quality problems.",
    "image": "/media/work/autodataset-lab.webp",
    "imageKind": "still",
    "alt": "One dark outlier stands above a drawer of neatly filed pale cards.",
    "focal": "55% 48%",
    "wideTitle": false,
    "tools": [
      "Dataset profiling",
      "Data cleaning",
      "Training data"
    ],
    "links": [],
    "notes": [
      {
        "title": "Profile the inputs",
        "body": "AutoDataset Lab was my first venture. It gives teams a place to inspect the rows of a training dataset and profile what they contain."
      },
      {
        "title": "Separate rows for review",
        "body": "The workflow moves from profiling to quarantine and cleaning. Suspect records can be examined separately as the dataset is prepared for training."
      }
    ]
  },
  {
    "slug": "shott",
    "name": "SHOTT",
    "category": "Client work",
    "field": "Venue operations",
    "description": "A booking platform that connects timed reservations with server-validated quotes and entry checks at the venue.",
    "image": "/work/live/shott.webp",
    "imageKind": "screenshot",
    "alt": "The SHOTT homepage: “Good times. Full volume.” over an arcade floor, with venue booking for Mumbai – Andheri.",
    "focal": "50% 0%",
    "wideTitle": false,
    "tools": [
      "Next.js",
      "TypeScript",
      "SQLite",
      "Motion"
    ],
    "links": [
      {
        "label": "Open the booking demo",
        "href": "https://next.shott.in/"
      }
    ],
    "notes": [
      {
        "title": "Reserve a time slot",
        "body": "The server checks the chosen venue and time, then validates the quote for tickets, extras and coupons. The public checkout runs in Razorpay test mode."
      },
      {
        "title": "Check guests in",
        "body": "A booking issues a signed QR entry credential. Staff can check entries within their own venue, while administrators manage bookings and site content. Demo tickets cannot be used for admission."
      },
      {
        "title": "Follow venue activity",
        "body": "Staff can export reports for bookings, guest counts and capacity by date. Funnel reports break down activity by device and venue, with test transactions tracked separately."
      }
    ]
  },
  {
    "slug": "shah-bv",
    "name": "Shah Business Ventures",
    "category": "Client work",
    "field": "Interactive property catalogue",
    "description": "A corporate and real estate website with a browsable property footprint, detailed listings and responsive WebGL motion.",
    "image": "/work/live/shah-bv.webp",
    "imageKind": "screenshot",
    "alt": "The Shah Business Ventures homepage: “Your strategic gateway to India’s growing market.”",
    "focal": "50% 0%",
    "wideTitle": true,
    "tools": [
      "React",
      "TypeScript",
      "Vite",
      "Three.js",
      "Framer Motion"
    ],
    "links": [
      {
        "label": "Visit Shah Business Ventures",
        "href": "https://shahbv.vercel.app/"
      }
    ],
    "notes": [
      {
        "title": "Browse the property footprint",
        "body": "The site brings together the company’s ventures, locations, real estate and team. Visitors can open a property card and see its details in the context of the list."
      },
      {
        "title": "Carry context between pages",
        "body": "Three.js scenes and coordinated transitions connect the pages. Motion adapts to device size and reduced-motion preferences. The enquiry form validates its fields and opens a prepared email."
      }
    ]
  },
  {
    "slug": "fossae",
    "name": "FOSSAE",
    "category": "Client work",
    "field": "Fashion commerce",
    "description": "A fashion storefront with merchant tools for product variants, inventory, orders and consent-gated analytics.",
    "image": "/work/live/fossae.webp",
    "imageKind": "screenshot",
    "alt": "The FOSSAE homepage: the Ebony & Ivory collection, a model in a black embellished dress.",
    "focal": "50% 0%",
    "wideTitle": false,
    "tools": [
      "Node.js",
      "Express",
      "Liquid",
      "PostgreSQL",
      "GA4"
    ],
    "links": [
      {
        "label": "Visit FOSSAE",
        "href": "https://fossae.in/"
      }
    ],
    "notes": [
      {
        "title": "Connect the storefront to fulfilment",
        "body": "Customers choose a variant, add it to the cart and can revisit the order in their account. Stock, order and shipping tools connect the merchant to Razorpay payment events and Shiprocket fulfilment."
      },
      {
        "title": "Measure the buying journey",
        "body": "First-party reports follow campaign attribution and the path from product visit through cart and checkout. The GA4 integration records events after consent."
      }
    ]
  },
  {
    "slug": "barenature",
    "name": "BareNature",
    "category": "Client work",
    "field": "Storefront operations",
    "description": "An ecommerce storefront with product variants, inventory workflows, PDF invoices and corporate gifting enquiries.",
    "image": "/work/live/barenature.webp",
    "imageKind": "screenshot",
    "alt": "The BareNature homepage: “Good ingredients. Great flavours. Simply BareNature.” beside a tin of millet almond cookies.",
    "focal": "50% 0%",
    "wideTitle": false,
    "tools": [
      "React",
      "Vite",
      "Node.js",
      "PostgreSQL",
      "PDF-lib"
    ],
    "links": [
      {
        "label": "Visit BareNature",
        "href": "https://barenature.co.in/"
      }
    ],
    "notes": [
      {
        "title": "Support two kinds of buyer",
        "body": "Storefront customers select products and check out against server-calculated prices. Corporate gifting buyers can request a separate quote."
      },
      {
        "title": "Run the order desk",
        "body": "Staff can manage stock, orders and customer records, then generate downloadable GST invoices. A dashboard brings together first-party sales and funnel data."
      }
    ]
  },
  {
    "slug": "reaxon",
    "name": "Reaxon Innovations",
    "category": "Client work",
    "field": "Product catalogue",
    "description": "A pharmaceutical catalogue with structured product pages, business enquiries and a careers intake workflow.",
    "image": "/work/live/reaxon.webp",
    "imageKind": "screenshot",
    "alt": "The Reaxon Innovations homepage: “Reimagining Chemistry” over laboratory glassware.",
    "focal": "50% 0%",
    "wideTitle": false,
    "tools": [
      "React",
      "TypeScript",
      "Vercel Functions",
      "Turso",
      "GSAP"
    ],
    "links": [
      {
        "label": "Visit Reaxon Innovations",
        "href": "https://reaxon.in/"
      }
    ],
    "notes": [
      {
        "title": "Keep enquiries in context",
        "body": "Each product in the pharmaceutical catalogue can lead into an enquiry. The product context carries through so visitors can ask about the item they found."
      },
      {
        "title": "Review incoming submissions",
        "body": "Business and careers forms include validation, consent records and attachments. Staff use role-based administration to manage content and review submissions by status."
      }
    ]
  }
];

export const CATEGORIES = ["All", "AI systems", "Client work"] as const;
export type Category = (typeof CATEGORIES)[number];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
