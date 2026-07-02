# Cross-post / distribution playbook

Drafts for republishing the hitarthdesai.com posts elsewhere. **Nothing here is
auto-published** — you paste it. The site is always the canonical home; every
cross-post must point its canonical back to the `hitarthdesai.com` URL so your site
gets the SEO credit and you don't get dinged for duplicate content.

## The rule that makes cross-posting safe
Set `canonical_url` (Dev.to/Hashnode) or the "originally published at" link (Medium)
to the post's URL on `hitarthdesai.com`. Publish on the site **first**, let it get
indexed, then cross-post.

## Where each post goes (match audience to post)
| Post | Dev.to | Hashnode | Hacker News | HackerNoon | Medium |
|---|---|---|---|---|---|
| Deterministic Structured Outputs | ✅ | ✅ | ✅ (Show HN-ish, link the essay) | ✅ | ✅ |
| Zero Round-Trips (confident-extract v0.1.0) | ✅ | ✅ | ✅ (release/Show) | ✅ | – |
| msgspec vs Pydantic vs dataclasses | ✅ | ✅ | ✅ (dev crowd loves this) | – | – |
| The 200ms You Can't See (latency) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Synthetic Data Won't Save Your Eval Set | – | – | ✅ (contrarian, HN-shaped) | ✅ | ✅ |
| Schema Drift | ✅ | ✅ | ✅ | – | – |
| Backpressure & Retry Budgets | ✅ | ✅ | ✅ | – | – |

## Platform notes
- **Dev.to** — has a publish API if you add a token later; for now paste the
  `devto-*.md` drafts (frontmatter already set: `published: false`, `canonical_url`).
  Max 4 tags, lowercase. Flip `published: true` when ready.
- **Hashnode** — same body + canonical as the Dev.to draft; set canonical in the
  post settings. Manual paste (or API with a token later).
- **Hacker News** — submit the `hitarthdesai.com` URL directly, plain title, no
  marketing language. HN punishes hype; the essays are written claim-first for this.
  Community norm is you submit your own link and show up in the comments.
- **HackerNoon** — editorial submission; paste the body, set the canonical to the
  site. Longer lead time (human review).
- **Medium** — Import Story from the canonical URL (auto-sets "originally published
  at"), or paste and add the canonical link manually. API is deprecated → manual.
- **LinkedIn & X** — never auto-posted (flag risk, no safe write API). Use the
  snippets in `social-snippets.md`; you post them.

## Cadence
One substantive post per 1–2 weeks, each cross-posted a few days after it's live on
the site. Do **not** blast all platforms with all posts at once — that's the
scaled-content pattern that hurts you. Pace it.

## SeerFlow
Where a post or snippet has a natural spot for SeerFlow, it's left out pending real
copy (see `src/data/content.js` → `author.building`). Add the one-liner there and to
the relevant snippets once you send it — don't invent capabilities.
