# hitarthdesai.com

Portfolio of Hitarth Desai, AI Systems Engineer. A small Next.js app: static pages and plain CSS. Lenis provides smooth scrolling; everything else is React and CSS.

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # every route is prerendered
```

## Where to edit

| Change | File |
| --- | --- |
| Case studies (copy, tools, links, images) | `src/content/projects.ts` |
| Name, social links, structured data | `src/content/profile.ts` |
| Field notes shown on the homepage | `src/content/notes.ts` |
| Blog posts | `content/blog/*.md` (front matter: title, description, excerpt, date, tags) |
| Intro, hero, menu, selected work (`Showcase.tsx`), field, notes, After Hours, footer | `src/components/` |
| Which live sites lead the selected work, and their URLs | `LIVE` in `src/components/Showcase.tsx` |
| Palette, type and section styles | `src/styles/` (`base.css` holds the tokens, `motion.css` the shared reveals, cursor and grain) |
| Images | `public/media/`; live-site captures (2000 × 1250) in `public/work/live/` |

The visual system (grayscale palette, Open Sans Condensed display type, motion timings) follows the 2026 portfolio design handoff. Fonts and their licence are in `src/fonts/`.

Motion respects `prefers-reduced-motion`: the intro, smooth scrolling, the hero pin, the work dive and the scroll reveals all stand down, and the content stays readable without JavaScript.
