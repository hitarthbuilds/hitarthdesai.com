---
title: "Your Marketing Site Is a Trust Boundary: How SeerFlow's Landing Page Talks to Its Product API"
seoTitle: "Signed Same-Origin Relays — SeerFlow's Landing-to-API Architecture | Hitarth Desai"
description: "Why SeerFlow's public landing site never lets the browser call the product API directly: same-origin route handlers validate, size-limit, time-box and sign every request, so the backend can trust who is calling without trusting the internet."
excerpt: "Most teams treat the marketing site as a brochure. In SeerFlow it's the first hop of the product's trust boundary: every form, diagnosis and event goes through a same-origin relay that validates, bounds and signs the request before the API ever sees it."
slug: marketing-site-is-a-trust-boundary-seerflow
date: 2026-11-13
tags:
  - SeerFlow
  - system architecture
  - API security
  - Next.js
  - production engineering
  - fintech
canonical: https://hitarthdesai.com/blog/marketing-site-is-a-trust-boundary-seerflow/
---

In [an earlier post](/blog/ai-explains-backend-computes-seerflow/) I described the rule at the centre of [SeerFlow](https://seerflow.in), the decision-intelligence layer I'm building for Indian D2C brands: **AI explains, the backend computes.** That post was about the inside of the system. This one is about its front door.

SeerFlow's public site isn't just a brochure. Visitors pick the problem that hurts most (cash control, RTO, settlements, true profit, forecasting), answer a short diagnosis when they don't know, run calculators, and leave their details to see a tailored solution. All of that has to reach the product API. And the moment a public web page can write to your product backend, the marketing site is part of your security perimeter whether you planned it that way or not.

So I planned it.

## The rule: the browser never talks to the product API

Every write from the landing site goes to a **same-origin route handler** on the site itself, never cross-origin to the API. The handler is a small, boring relay, and the boring part is the point. Before anything leaves it, a request has to pass five checks:

1. **Allow-list the destination.** The relay forwards to a fixed set of named resources. Anything else is a 404 at the edge, so the route can't be turned into a general-purpose proxy into the backend.
2. **Enforce the content type.** JSON or nothing (`415`). The upstream parser never sees a payload shape it didn't expect.
3. **Bound the body twice.** The declared `Content-Length` is checked first, then the bytes actually read, against a small fixed ceiling (`413`). Checking only the header trusts the client; checking only the bytes means you've already buffered the abuse.
4. **Time-box the hop.** The upstream call runs under an abort timer. A slow backend gives the visitor a clear `502`/`503`; it never pins a serverless function open indefinitely.
5. **Fail closed when it isn't configured.** No API base URL or no signing secret means `503 Service not configured`. It does not fall back to an unsigned request, and it does not quietly succeed.

None of this is novel. What matters is that it's all in one place and it's all mechanical, the same philosophy as the [numeric guardrail](/blog/ai-explains-backend-computes-seerflow/): don't ask the downstream system to be careful, make it structurally impossible for it to receive something it shouldn't.

## Signed client identity: trust the relay, not the internet

The harder problem is identity. The API needs a stable notion of *who is calling* for rate limiting, abuse control and stitching an anonymous diagnosis to a later signup. The obvious source is the client IP, and the obvious source is also the easiest to spoof: any caller can send a forwarding header claiming to be anyone.

SeerFlow's answer has two parts:

- **Only one header is trusted, and only in production.** On the hosting platform, the relay reads the forwarded-for header *the platform itself* sets and normalises at the edge. Caller-supplied forwarding headers are never accepted as identity in production. Local development has no public trust boundary, so it uses a simpler rule there without weakening production.
- **The relay signs what it vouches for.** The relay derives an opaque client key from that address with a keyed hash (so the API never needs the raw address to rate-limit), then signs the key together with a timestamp using a secret shared only with the API. The API verifies the signature and the timestamp's freshness before it believes anything.

Any additional context the relay forwards, such as the user agent used to improve server-side conversion matching, travels *alongside* the signed identity, and the API only reads it after the signature verifies. An unauthenticated caller hitting the API directly can send whatever headers it likes; none of them mean anything without a valid signature.

The result is a clean separation: the internet is untrusted, the relay is trusted for exactly one thing (vouching for who it saw), and the API trusts the relay only to the extent it can cryptographically check.

## Pass through what's useful, strip everything else

On the way back, the relay is just as selective. It forwards the upstream status and body, plus the handful of headers the browser genuinely needs: content type, `Retry-After` so the UI can back off honestly, and a trace ID so a support ticket can be followed end to end through the site, the relay and the API. Everything is marked `no-store`. Internal headers don't leak out, and responses carrying personal details never land in a shared cache.

Consent follows the same discipline. The visitor's marketing-consent choice is forwarded only when it's one of the two values the system recognises. Anything else is dropped rather than interpreted.

## Failures that keep the user's work

The trust boundary isn't only about attackers. It's also about not punishing honest users when something breaks. If saving a visitor's details fails, the tailored solution stays hidden *and the form keeps what they typed*. Repeat submissions reuse the capture that was already accepted, and later visits preserve the contact's original source rather than overwriting it. Diagnosis results are presented as ranked hypotheses; the site is explicit that connected business data is needed to verify the real issue. A landing page shouldn't overclaim any more than a treasury dashboard should invent a number.

## The general principle

Strip away the specifics and this generalises to any product with a public site in front of a real backend:

1. **Make the site's server, not the browser, the only client of your API.** Same-origin relays give you one place to validate, bound and observe every write.
2. **Decide which identity signals you trust and sign them at the boundary.** Never let "who is calling" be something the caller asserts.
3. **Fail closed on missing configuration.** A relay that silently goes unsigned when a secret is missing is worse than one that's down.
4. **Treat errors as product surface.** Clear status codes, honest retry hints, trace IDs, and never losing what the user typed.

It's the same idea as everything else in SeerFlow, applied one layer further out: probabilistic or untrusted inputs at the edges, deterministic and enforceable boundaries in the middle. The next post in this series will go back inside, to the reconciliation engine.
