import type { Project } from "./projects";

export const CLIENT_PROJECTS: Project[] = [
  {
    slug: "shott",
    name: "SHOTT",
    format: "Client project",
    status: "Venue booking & operations",
    side: "C",
    track: "C1",
    blurb:
      "A venue booking platform that connects timed reservations, server-validated quotes and on-site entry checks.",
    tech: ["Next.js", "TypeScript", "SQLite", "Motion"],
    links: [{ label: "next.shott.in", href: "https://next.shott.in/" }],
    metrics: [],
    clientWork: {
      image: "/client-work/shott.jpg",
      alt: "SHOTT venue homepage with arcade games, a booking action and a Razorpay test-mode notice.",
      sections: [
        {
          title: "Book by venue and time",
          body: "I built the booking flow around venue and time-slot selection. The server checks availability and validates quotes for ticket quantities, extras and coupons.",
        },
        {
          title: "Check in at the venue",
          body: "I implemented signed QR entry credentials and staff checks scoped to each venue, alongside booking and content administration.",
        },
        {
          title: "See what happens after launch",
          body: "I built venue-scoped operations reports for bookings, guests and capacity. First-party funnel reporting breaks down booking activity by device and venue. Staff can export date-filtered reports, with test payments kept separate from live figures.",
        },
      ],
      note: "Public checkout uses Razorpay test mode. Demo tickets cannot be used for venue entry.",
    },
  },
  {
    slug: "shah-bv",
    name: "Shah Business Ventures",
    format: "Client project",
    status: "Interactive corporate website",
    side: "C",
    track: "C2",
    blurb:
      "An interactive corporate and real estate website with a browsable footprint, property details and responsive WebGL motion.",
    tech: ["React", "TypeScript", "Vite", "Three.js", "Framer Motion"],
    links: [{ label: "shahbv.vercel.app", href: "https://shahbv.vercel.app/" }],
    metrics: [],
    clientWork: {
      image: "/client-work/shah-bv.jpg",
      alt: "Shah Business Ventures homepage with oversized typography, a city photograph and company navigation.",
      sections: [
        {
          title: "Explore the footprint",
          body: "I developed pages for ventures, locations, real estate and the team. Expandable property cards keep project details in context as visitors browse.",
        },
        {
          title: "Motion and contact",
          body: "I built Three.js scenes and coordinated page transitions. The experience adapts to smaller devices and reduced-motion preferences. The contact form validates entries and opens a prefilled email.",
        },
      ],
    },
  },
  {
    slug: "fossae",
    name: "FOSSAE",
    format: "Client project",
    status: "Fashion commerce & merchant tools",
    side: "C",
    track: "C3",
    blurb:
      "A fashion storefront and merchant workspace with product variants, inventory, orders and consent-gated analytics.",
    tech: ["Node.js", "Express", "Liquid", "PostgreSQL", "GA4"],
    links: [{ label: "fossae.in", href: "https://fossae.in/" }],
    metrics: [],
    clientWork: {
      image: "/client-work/fossae.jpg",
      alt: "FOSSAE fashion storefront showing its Ebony & Ivory collection and shopping navigation.",
      sections: [
        {
          title: "From catalogue to order history",
          body: "I implemented the storefront and commerce backend, including product variants, cart, customer accounts and order history. Merchant tools cover stock, orders and shipping, with Razorpay signature and webhook handling and Shiprocket fulfilment workflows.",
        },
        {
          title: "Analytics with consent",
          body: "I built merchant reports for campaign attribution and the path from a product visit to cart and checkout. I also implemented a separate, consent-gated GA4 integration. Event receipt was verified during handover.",
        },
      ],
    },
  },
  {
    slug: "barenature",
    name: "BareNature",
    format: "Client project",
    status: "Ecommerce & operations",
    side: "C",
    track: "C4",
    blurb:
      "A database-backed storefront with product variants, order and inventory tools, PDF invoices and corporate gifting enquiries.",
    tech: ["React", "Vite", "Node.js", "PostgreSQL", "PDF-lib"],
    links: [{ label: "barenature.co.in", href: "https://barenature.co.in/" }],
    metrics: [],
    clientWork: {
      image: "/client-work/barenature.jpg",
      alt: "BareNature storefront with a millet almond cookie tin, product navigation and a corporate gifting link.",
      sections: [
        {
          title: "Shop or request a gifting quote",
          body: "I built product selection, cart and checkout with server-side pricing. Corporate gifting enquiries follow a separate quote flow.",
        },
        {
          title: "Run orders and inventory",
          body: "I developed staff tools for order and stock management, customer records and downloadable GST invoices. The dashboard reports first-party sales and funnel activity.",
        },
      ],
    },
  },
  {
    slug: "reaxon",
    name: "Reaxon Innovations",
    format: "Client project",
    status: "Product catalogue & intake",
    side: "C",
    track: "C5",
    blurb:
      "A pharmaceutical company website with a structured product catalogue, business enquiries and a careers intake workflow.",
    tech: ["React", "TypeScript", "Vercel Functions", "Turso", "GSAP"],
    links: [{ label: "reaxon.in", href: "https://reaxon.in/" }],
    metrics: [],
    clientWork: {
      image: "/client-work/reaxon.jpg",
      alt: "Reaxon Innovations homepage with laboratory glassware and navigation to products, capabilities and careers.",
      sections: [
        {
          title: "Catalogue and contextual enquiries",
          body: "I built a structured product catalogue so visitors can browse the company’s products and start an enquiry from the relevant product context.",
        },
        {
          title: "Intake and review",
          body: "I built business and careers intake with validation, consent records and attachments. Role-based admin views let staff manage content and review submissions by status.",
        },
      ],
    },
  },
];
