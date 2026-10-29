# Build prompt: hitarthdesai.com, "Forged" metal portfolio

> Paste everything below the line into Claude Code (or any coding agent) inside a fresh, empty folder.

---

You are building the new personal portfolio for **Hitarth Desai** at **hitarthdesai.com**. It replaces the current site. Make it unforgettable: a dark, cinematic, **metal-based** site where liquid chrome, brushed steel, molten forge-orange and iron filings carry the motion design. Underneath, it must be fast, accessible and technically credible, because the audience is founders and engineering leads hiring an AI systems engineer.

The concept: **reliable AI systems are forged, not demoed.** Hitarth hardens LLMs for production, and he is an international gold-medal powerlifter. Iron is literal and metaphorical. Every section is a stage in forging metal, which mirrors his raw-text → structured-output pipeline work.

## 1. Tech stack (pin these versions)

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16.4.3**, App Router, React **19.3.1**, TypeScript **5.9.3**, fully static (SSG) where possible |
| Styling | **Tailwind CSS 4.3.3** via `@tailwindcss/postcss`; design tokens as CSS variables mapped in `@theme inline` |
| Motion | **GSAP 3.15.0** (all plugins are free: ScrollTrigger, SplitText with `mask`, ScrambleTextPlugin, Flip, CustomEase, Observer) + **@gsap/react 2.1.2** (`useGSAP`) |
| Smooth scroll | **Lenis 1.3.27**, driven by `gsap.ticker` and synced to `ScrollTrigger.update` |
| 3D / shaders | **Raw WebGL fragment shaders**, no three.js. Hand-written GLSL in a tiny `<ShaderCanvas>` component, plus a Canvas 2D particle field |
| Fonts | `next/font/google`: **Bricolage Grotesque** (display, use `wdth` 75–85 + `opsz` axes), **Geist** (UI), **Geist Mono** (labels, code, counters), **Instrument Serif** italic (accent words) |
| Blog | MDX in `content/blog/*.mdx` with typed frontmatter; code blocks highlighted with Shiki at build time |
| OG images | `next/og` (`ImageResponse`) generating metal-styled OG cards per page/post |
| Analytics | Vercel Analytics (no cookie banner needed) |
| AI concierge | `@anthropic-ai/sdk`, model `claude-opus-5-5` at `effort: "low"`, structured JSON output, server-side refusal fallback (`fallbacks: "default"`); see §9 |
| PDF résumé | `jspdf`, lazy-loaded, generated on-device from `profile.ts` |
| Hosting | Vercel, GitHub auto-deploys from `main`, domain hitarthdesai.com |
| Tests | `node:test` via `tsx` for data and utility tests; Playwright smoke test of every route if time allows |

No UI kit. No three.js. No Framer Motion. Everything animated goes through GSAP so it shares one ticker.

## 2. Design system: "Forged"

### Tokens (CSS variables on `:root`, dark only)
```
--void:      #08090b   page background (blued steel black)
--steel-1:   #101216   panels
--steel-2:   #171a1f   raised
--steel-3:   #20242b   inputs / tracks
--line:      rgba(220,228,240,.08)
--line-2:    rgba(220,228,240,.16)
--chrome:    #e9edf2   primary text (cool white, never pure #fff)
--mute:      #9aa1ab   secondary text (≥ 4.5:1 on --void)
--dim:       #6a717c
--forge:     #ff6a1a   PRIMARY ACCENT: molten orange (CTAs, focus, highlights)
--ember:     #ffb547   hot highlight / gradient partner of forge
--titanium:  #7fb6ff   cool secondary accent (links, charts)
--gold:      #d9b45a   reserved for the gold-medal moment only
--rust:      #c2410c   errors / failure states
```

### Signature surfaces and classes
- `.chrome-text`: a multi-stop silver gradient (`#fdfdfd → #a9b0ba → #5c636d → #e9edf2 → #8b929c`) clipped to the text. A specular sheen band sweeps across it on hover and on reveal (animate `background-position`).
- `.brushed`: brushed-steel panels. Use `repeating-linear-gradient(90deg, …)` with 1px hairlines at 2–3% opacity, plus a tiny SVG `feTurbulence` noise overlay. Panels get a 1px top highlight (`inset 0 1px 0 rgba(255,255,255,.06)`) and a hard bottom shadow, so they read as machined plates.
- `.plate`: project cards styled as machined plates. Add four corner "bolts" (small radial-gradient circles), an engraved mono label (`text-shadow: 0 1px 0 rgba(255,255,255,.06), 0 -1px 0 rgba(0,0,0,.6)`), and a sheen that follows the pointer (`--mx/--my` driving a narrow, angled linear-gradient highlight that moves with the cursor).
- `.molten`: an orange→ember glow used sparingly. Text glows like heated metal, cooling from white-hot to orange to steel over ~1.2s after a reveal.
- `.text-outline`: outlined display text. **Must use** `color: var(--void); -webkit-text-stroke: 2–3px …; paint-order: stroke fill;` because variable fonts expose overlapping contours with transparent-fill strokes.
- A global film grain (SVG noise, 6% opacity, stepped jitter animation), hidden under `prefers-reduced-motion`.
- Focus ring: 2px `--forge` outline, 3px offset, everywhere except inputs that are visibly focused.

### Type scale
- Display: Bricolage Grotesque 700–800, `letter-spacing: -0.045em`, `line-height: .88`, `wdth 80`, sizes `clamp(3.2rem, 10.5vw, 11rem)` for the hero.
- Section eyebrows: Geist Mono 11px, `letter-spacing: .18em`, uppercase, prefixed with the section number, like `03 / FORGE`.
- Accent words: Instrument Serif italic in `--forge`, for example "…in *production.*"

## 3. Information architecture (keep the numbered-section DNA)

Single long homepage with the existing 01–09 rhythm, renamed as forging stages. Keep the original names as small subtitles so returning visitors recognise the structure.

| # | Section | Was | Content |
| --- | --- | --- | --- |
| 01 | **Ore** | Source | Hero, intro, status pill, social links |
| 02 | **Smelt** | Extract | Focus areas + the interactive raw-text → schema-valid JSON demo |
| 03 | **Forge** | Structure | Selected projects (horizontal pinned gallery) |
| 04 | **Alloy** | Stack | Tools, grouped |
| 05 | **Temper** | Trace | Experience + education timeline |
| 06 | **Assay** | Query | FAQ (an assay tests metal purity; this tests fit) |
| 07 | **Press** | Publish | Latest writing |
| 08 | **Iron** | Signal | Powerlifting and personal interests |
| 09 | **Strike** | Ship | Contact CTA |

Routes: `/`, `/blog`, `/blog/[slug]`, `/projects/[slug]` (one deep-dive page per project), `/uses` (optional), `/rss.xml`, `/sitemap.xml`, `/robots.txt`, a themed 404.

**Preserve existing URLs exactly:**
- `/blog/dead-letter-queues-llm-extraction-pipelines`
- `/blog/constrained-decoding-vs-post-hoc-validation-llm-extraction`

Add `redirects()` for any other path the old site exposed.

## 4. Content (single source of truth in `src/content/profile.ts`)

Use this verbatim as the starting point. Fields marked TODO need Hitarth's input; render them gracefully when empty.

- **Name:** Hitarth Desai · **Title:** AI Systems Engineer · **Location:** Surat, Gujarat, India
- **Tagline:** "I build the layer that makes LLMs reliable in production."
- **Status pill (live dot):** Open to AI Systems & Founding Engineer roles at seed–Series A startups
- **Bio:** Currently at InfraDock AI, designing LLM-powered document-processing pipelines. Focused on the gap between models that demo well and systems that survive real traffic: schema-constrained extraction, async and batched pipelines, and observability. Publishes the tools he needed but couldn't find.
- **Projects**
  1. **confident-extract**: open-source Python library for deterministic, schema-constrained structured extraction, built on msgspec. On PyPI: https://pypi.org/project/confident-extract/. TODO: downloads/stars (fetch live, see §7).
  2. **promptcrucible**: multi-agent prompt-optimization workbench for testing and improving prompts against eval harnesses. *In active development.*
  3. **AnswerRank AI**: AEO diagnostic tool (Gemini + Firecrawl) that scores how discoverable a page is to AI answer engines.
  4. **AutoDataset Lab**: first venture; a dataset-intelligence platform to inspect, profile and clean ML training data.
- **Experience:** AI Systems Engineer, InfraDock AI (current) · 2× AI/ML Lead, GDSC Surat (taught and built with a few hundred student engineers over two terms) · Backend & systems, independent/contract (event-driven backtesting infrastructure, microservice platforms). TODO: dates.
- **Education:** B.E. Computer Engineering, Gujarat Technological University, graduating 2026.
- **Stack:** Python, TypeScript, Rust (learning) · structured outputs, constrained decoding, msgspec, LangChain, vLLM · Docker, Kubernetes, Terraform, Kafka, microservices · async pipelines, batching, eval harnesses, observability.
- **Achievements:** International gold-medal powerlifter · two terms as AI/ML Lead at GDSC Surat · open-source tools on PyPI and GitHub. TODO: meet name, year, weight class, best total.
- **Links:** GitHub https://github.com/hitarthbuilds · Hugging Face https://huggingface.co/hitarthbuilds · LinkedIn https://www.linkedin.com/in/hitarth-desai10 · X https://x.com/hitarthbuilds · PyPI https://pypi.org/user/hitarth_builds_10/ · Email: TODO (the current site lists none; the contact section needs one).

## 5. Signature experiences (section by section)

**Global**
- **Preloader (first visit per session only, gated by an inline `<head>` script + `sessionStorage`):** a mechanical counter in Geist Mono races `000 → 100` while a ticker cycles "heating crucible… pouring… quenching… tempering…". At 100, a hammer strike: a sharp 120ms screen shake (GSAP `x/y` jitter on the overlay), a burst of sparks (canvas), then the overlay splits like a guillotine shear (`clip-path` top and bottom halves). Fire a `pl:done` event so the hero intro starts in sync.
- **Cursor:** a chrome ring with `mix-blend-difference` plus a forge-orange dot. Over `[data-cursor="label"]` elements, a pill label appears. The native cursor stays visible.
- **Magnetic buttons:** primary CTAs pull toward the pointer (quickTo, ~0.35 strength) and snap back with an elastic ease. Name the wrapper `<Magnetic>`; it is literally the theme.
- **Route transition (`app/template.tsx`):** a steel shutter drops and lifts on client navigation. Animate only the curtain and the page's **opacity**; never transform the page wrapper, because it breaks fixed and pinned children.
- **⌘K command palette:** searches projects, posts, sections and links. Actions include "Copy email", "Open GitHub" and "Download résumé". It has a glass panel, keyboard navigation and a staggered row entrance.

**01 Ore (hero)**
- **Liquid-chrome WebGL background (`ShaderCanvas`):**
  1. Build a domain-warped fbm height field `h(p,t)`.
  2. Derive normals via finite differences, then reflect the view vector off them.
  3. Shade with a procedural studio environment: two or three bright horizontal softbox bands, a dark floor and a cool blue rim, plus Schlick fresnel.
  4. The pointer is a heat source: within a radius the surface dents slightly and glows forge-orange → ember, cooling back to chrome over about a second.
  5. Render at 0.5× resolution, cap DPR, pause when offscreen or the tab is hidden, and clamp the output colour.
- **Iron-filings field (Canvas 2D, right half on desktop, behind the copy on mobile):** about 1,200 short line segments (pre-rendered sprites) behave like filings on paper. Each one orients along a dipole field centred on the cursor, so moving the mouse makes them swirl and align. Every ~3.6s they assemble into a glyph, cycling **HD monogram → `{ }` → `⟶` → a barbell plate silhouette**, scattering with a burst between shapes. Assign targets by sampling an offscreen glyph's alpha.
- **Headline:** "I forge the layer that makes LLMs *reliable* in production." Use SplitText chars with masks, a staggered rise, and `.chrome-text` with one sheen sweep on reveal. The serif italic accent word glows molten, then cools.
- Below it: the status pill with a pulsing forge dot, two magnetic CTAs ("See the work" → 03, "Read the writing" → /blog), social icons, and a rotating circular SVG text badge reading "FORGED NOT DEMOED ·" around a small anvil glyph.
- On scroll-away, parallax the copy upward and fade it; the filings drift and scale.

**02 Smelt (the signature interactive demo; pinned)**
- Pin the section (`+=200%`, desktop only via `gsap.matchMedia`).
- **Left:** a "raw ore" panel holding a messy invoice or email as plain text.
- **Right:** a JSON panel and a small schema card (`invoice_id: str`, `total: Decimal`, `due: date`, …).
- As the user scrolls, a scrubbed timeline "smelts" the ore:
  - Spans in the raw text glow molten one by one.
  - Each fragment flies (Flip) into its JSON key, where its value resolves with ScrambleText.
  - A "schema valid ✓" seal stamps in with a hammer-hit shake.
  - One deliberately bad field turns rust-red, then gets caught and repaired, which shows post-hoc validation.
- After the pin releases, it becomes interactive: users can edit the raw text and a deterministic client-side mock extractor (regex-based; no API calls) re-runs, so the JSON morphs live.
- Below the demo, three focus cards: **Schema-constrained extraction**, **Async & batched pipelines**, **Observability & eval harnesses**.

**03 Forge (projects; horizontal pinned gallery)**
- Pin the section and translate the track horizontally with `containerAnimation`. Each card rotates in from `rotateY(-14deg)` as it enters.
- Each project is a `.plate` card with a live mini-visual:
  - **confident-extract:** text streams into a typed schema, invalid tokens get rejected (strike-through, red), and the valid object locks with a bolt animation. Show live PyPI downloads and GitHub stars as **mechanical odometers**.
  - **promptcrucible:** a crucible of molten metal. Prompt variants drop in as droplets, an eval score bar climbs per iteration, and the best variant is crowned.
  - **AnswerRank AI:** an analog pressure gauge (SVG arc bands + spring-overshoot needle) scoring "AI-answer discoverability", sweeping between sample sites.
  - **AutoDataset Lab:** a dataset grid where bad rows flash rust, get quarantined, and clean rows settle into place (Flip).
- Every card links to `/projects/[slug]`. Deep-dive pages hold the problem, architecture diagram (inline SVG), decisions, results/TODO metrics and links.
- On mobile, stack the cards vertically with no pin.

**04 Alloy (stack)**
- Two velocity-reactive marquees of tool names styled as **embossed metal stamps**: one row filled, one outlined, in opposite directions. Skew and speed react to scroll velocity.
- Below them, a grid grouped by Languages / LLM & data / Infra / MLOps. Each chip has a hover sheen, and "Rust (learning)" shows a progress-bar "heat treatment" at about 30%.

**05 Temper (experience + education)**
- A vertical timeline whose spine is a heated bar: scrubbed to scroll, it cools from white-hot → orange → steel as you pass each role.
- Each entry reveals with SplitText lines. The current role (InfraDock AI) pulses gently.
- Education closes the timeline: "B.E. Computer Engineering, GTU, 2026."

**06 Assay (FAQ)**
- An accordion of `<details>` rendered as machined panels. The "+" icon rotates 45°.
- Each answer opens with a short metal "ping" scale animation.
- Questions should be what founders actually ask: what he's best at, how he approaches reliability, remote/timezone, availability, OSS work.
- Output FAQPage JSON-LD.

**07 Press (writing)**
- The latest 3 posts as large rows with date, read time and an arrow that slides on hover. Optionally, a hover-follow preview card shows the post's OG image.
- The `/blog` index has tag filters animated with GSAP Flip.
- Post pages:
  - MDX with Shiki-highlighted code on a gunmetal background, a reading-progress bar in forge orange, a table of contents with scroll-spy, and copy buttons on code blocks.
  - Article JSON-LD and a per-post OG image.
  - RSS at `/rss.xml`.

**08 Iron (powerlifting + interests)**
- A barbell that **loads itself on scroll**: plates slide onto both sleeves one by one (colour-coded competition plates), then the bar "lifts" with a slight bend and settles.
- A **gold medal coin** card in `--gold`, with a foil sheen that tilts toward the pointer (3D tilt plus a moving specular gradient) and the text "International gold medalist".
- Stats as odometers (TODO values: total, weight class, years lifting).
- A line tying it back: *discipline under load is the same skill as systems under load.*

**09 Strike (contact)**
- A giant headline, "Let's forge something.", revealed char by char.
- A big circular magnetic button "Email me" (copies to clipboard with a "Copied ✓" spark burst; also `mailto:`) and a secondary "Book a call" (TODO link).
- Socials as magnetic icon buttons.
- **Footer:** a full-width outlined wordmark "HITARTH" (uses the `paint-order` stroke fix). On pointer move, the letters nearest the cursor bulge vertically and fill with chrome, then spring back.

## 6. Engineering rules (lessons already learned; follow them)

1. **WebGL + React StrictMode:** never call `WEBGL_lose_context.loseContext()` in an effect cleanup. The dev-mode remount gets the same, now-dead context back and paints the canvas white. Guard with `if (!gl || gl.isContextLost()) return;`.
2. **GLSL `smoothstep(e0, e1, x)` with `e0 > e1` is undefined behaviour.** Write `1. - smoothstep(e1, e0, x)` instead, and clamp the final colour.
3. **StrictMode-safe "first load" flags:** effects run twice synchronously in dev. Flip module-level flags inside a `setTimeout(…, 0)`, or the route curtain will play on initial load.
4. **Hide-before-paint:** don't rely on CSS `visibility:hidden` for split text (it stays invisible without JS). Do `gsap.set(chars, { yPercent: 120 })` inside `useGSAP` (a layout effect) before first paint, then animate `to`.
5. **Never transform the page wrapper or any ancestor of pinned/fixed elements.** Use opacity only for page transitions. Clear GSAP props after tweens on ancestors of modals.
6. **`-webkit-text-stroke` + variable fonts** needs a solid fill with `paint-order: stroke fill`; transparent fill shows internal contour overlaps.
7. **Lenis:** create one instance, drive it from `gsap.ticker`, call `lagSmoothing(0)`, add `data-lenis-prevent` on scrollable modals and panels, and `scrollTo(0, { immediate: true })` on pathname change.
8. **`gsap.matchMedia()`:** desktop-only pins and horizontal scroll; everything degrades to a normal vertical flow on touch and narrow screens.
9. **`prefers-reduced-motion`:** disable Lenis, grain, shader animation (render one static frame), particles (static monogram) and scrubbed motion; keep instant state changes.
10. **Performance:**
    - Load the shader and particle canvases with `next/dynamic` and `ssr: false`.
    - Render shaders at ≤0.5× and cap DPR at 2.
    - Pause all rAF loops when offscreen (IntersectionObserver) or `document.hidden`.
    - Debounce ResizeObserver work.
    - Keep long lists out of client bundles.
11. **No layout shift:** reserve space for canvases and odometers, and use `next/font` with `display: swap` and size-adjusted fallbacks.

## 7. Data, SEO and polish

- **Live stats (ISR, `revalidate: 86400`):** fetch PyPI downloads (pypistats JSON API) and GitHub stars/repos (GitHub REST, unauthenticated or via a `GITHUB_TOKEN` env var) at build/revalidate time. Fall back to cached numbers if the APIs fail, never block render, and show "—" if unknown.
- **Metadata:** title template "%s · Hitarth Desai", rich descriptions, canonical URLs, Twitter/OG cards via `next/og` (a brushed-steel background, chrome title text and a forge-orange rule).
- **JSON-LD:**
  - `Person` with `jobTitle`, `address` (Surat, IN), `alumniOf` (GTU), and `sameAs` (GitHub, LinkedIn, X, Hugging Face, PyPI).
  - `WebSite` on the home page.
  - `Article` per post.
  - `FAQPage` for Assay.
- `sitemap.ts`, `robots.ts`, `rss.xml/route.ts`, a themed `not-found.tsx` ("404: this page was never forged").
- **Accessibility:**
  - Semantic landmarks, a skip link, every canvas `aria-hidden` (or `role="img"` with a real label when it conveys data).
  - Full keyboard support (palette, accordion, carousel fallback).
  - Contrast ≥ 4.5:1 for body text, and `aria-live` for the Smelt demo result.
- **Analytics events:** `palette_open`, `cta_click`, `project_open`, `email_copy`, `post_read_50` (scroll depth).

## 8. Project structure

```
src/
  app/            layout.tsx, template.tsx, page.tsx, blog/, projects/[slug]/, rss.xml/, sitemap.ts, robots.ts, not-found.tsx, opengraph-image.tsx
  content/        profile.ts (all copy & links), projects.ts, faq.ts
  components/
    layout/       Providers (Lenis + palette + cursor), Header, Footer, FooterWordmark, CommandPalette, Cursor
    fx/           ShaderCanvas (liquid chrome), FilingsField, Magnetic, Reveal (SplitReveal, Stagger, ScrubWords), Marquee, Tilt, Odometer, AnimatedNumber, Scramble, Sparks
    sections/     Ore, Smelt, Forge, Alloy, Temper, Assay, Press, Iron, Strike
    viz/          ExtractionDemo, Crucible, PressureGauge, DatasetGrid, Barbell, MedalCoin
  lib/            gsap.ts (register plugins + CustomEase "hop" 0.85,0,0.15,1 and "silk" 0.16,1,0.3,1), mock-extract.ts, stats.ts, mdx.ts
content/blog/     *.mdx (migrate both existing posts with identical slugs)
```

## 9. Upgrades (beyond a reskin; build these)

These turn the portfolio from "looks great" into "proves he can ship reliable AI systems".

1. **"Ask the Forge": an AI concierge that practises what he preaches.**
   - A mode inside the ⌘K palette, plus a floating "Ask" chip, answers questions about Hitarth ("Has he run vLLM in production?", "What's confident-extract for?").
   - Ground it with a tiny local retrieval index built at compile time from `profile.ts`, project pages and blog MDX: chunk, embed or BM25, ship as JSON. Run it from a Route Handler.
   - **Schema-constrained output:** `{ answer, citations: [{title, url}], confidence: "high"|"medium"|"low" }` via JSON-schema structured output. Render citations as linked chips.
   - When retrieval finds nothing, it must say "I don't know — email him", never invent.
   - Show a small **trace panel** (retrieved chunks, latency, validation result) so visitors see the observability mindset.
   - Treat visitor input as untrusted data in the system prompt.
   - Per-IP rate limit (e.g. Upstash Redis or Vercel KV), max ~400-char questions, streaming responses, and a graceful offline fallback to static FAQ matching when `ANTHROPIC_API_KEY` is absent.
   - Label it clearly as AI.
2. **Live "Furnace" status board** (inside Forge, or a `/lab` page):
   - A GitHub contribution heatmap rendered as glowing hot-metal tiles (cool steel → ember → white-hot by commit count).
   - PyPI download sparklines per package, with latest release versions.
   - The current focus ("Building promptcrucible…") from a JSON file he edits.
   - All fetched with ISR and cached; never client-side API keys.
3. **Interactive architecture diagrams for case studies.**
   - Inline SVG systems diagrams (queues, workers, validators, DLQ) where animated packets flow along edges (GSAP MotionPath).
   - Clicking a node explains its role.
   - The dead-letter-queue post gets a playable diagram: inject a malformed document, watch it fail validation, land in the DLQ, get triaged and replay successfully.
4. **One-click forged résumé.** "Download résumé" generates a clean, ATS-friendly PDF on-device from `profile.ts` (jsPDF, lazy-loaded): a steel header band, a forge-orange rule, and selectable text, so it is always in sync with the site with no stale PDF in the repo.
5. **Sound design (off by default).** A muted speaker toggle in the header enables subtle metal foley: a soft anvil tink on CTA clicks, a low whoosh on route changes, a plate clank when the barbell loads. Use the Web Audio API with tiny preloaded samples (<30 KB total), respect reduced-motion, and remember the preference in `localStorage`.
6. **Konami / easter egg.** Typing `deadlift` anywhere sends the filings field into an iron-plate rain, then "PR!" stamps in gold.
7. **Smelt demo upgrade.** Add a toggle between "Constrained decoding" and "Post-hoc validation" that replays the extraction both ways, side by side, showing where each catches failures. This is a live illustration of his own blog post.

## 10. Definition of done

- [ ] `npm run build` passes with zero type errors; every route is statically generated (except ISR stats).
- [ ] Lighthouse on hitarthdesai.com (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100. LCP < 2.0s, CLS 0, INP < 200ms.
- [ ] Both existing blog URLs resolve with identical slugs; old paths redirect.
- [ ] No horizontal scroll at 360px; pinned and horizontal sections degrade cleanly on mobile.
- [ ] Reduced-motion mode is fully usable and static.
- [ ] The hero shader renders correctly in Chrome, Safari and Firefox (check for white or black canvases under StrictMode and after route changes).
- [ ] All TODO content is either filled in or hidden gracefully.
- [ ] "Ask the Forge" cites sources on every answer, refuses gracefully when retrieval is empty, is rate-limited, and falls back to static FAQ matching without an API key.
- [ ] The résumé PDF downloads with selectable text and matches `profile.ts`.
- [ ] Deployed to Vercel from GitHub `main`, with `hitarthdesai.com` and `www` → apex redirect configured.

Work in this order:
1. Tokens + layout shell.
2. Hero (shader + filings).
3. Smelt demo.
4. Forge gallery.
5. The remaining sections.
6. Blog migration.
7. Upgrades from §9 (concierge first).
8. SEO/OG.
9. Performance and accessibility pass.
10. Deploy.

Show me the hero running locally before building past it.
