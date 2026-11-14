---
title: "A Public Calculator Is a Claim: How SeerFlow Keeps Its Estimates Honest"
seoTitle: "Honest Calculators — Deterministic Estimate Architecture in SeerFlow | Hitarth Desai"
description: "How SeerFlow's public profit-leak calculator is engineered so every number can be checked: integer paise, one authoritative engine with a pinned mirror, visible workings, assumptions named as assumptions, and published evidence kept away from the math."
excerpt: "A calculator on a marketing page looks like a toy. It's actually a claim about someone's business. Here's how SeerFlow's is built so every figure reconciles, every assumption is labelled, and nothing it prints pretends to be more than a scenario."
slug: public-calculator-is-a-claim-seerflow
date: 2026-11-14
tags:
  - SeerFlow
  - system architecture
  - deterministic systems
  - fintech
  - testing
  - production engineering
canonical: https://hitarthdesai.com/blog/public-calculator-is-a-claim-seerflow/
---

The rule inside [SeerFlow](https://seerflow.in) is that [AI explains and the backend computes](/blog/ai-explains-backend-computes-seerflow/). Yesterday I wrote about the [front door](/blog/marketing-site-is-a-trust-boundary-seerflow/): how the landing site relays requests to the product API. This post is about something on that landing site that looks much less serious than a signed relay and deserves the same care: the calculator.

A founder types in monthly revenue, ad spend, COD share and RTO rate, and a number comes back. That number is a claim about their business, made by a product whose whole pitch is that its numbers can be trusted. If the public calculator is sloppy, nobody should believe the dashboard behind it.

So the calculator follows five rules.

## 1. Money is an integer

Every amount is held in **paise**, as an integer. Rates are whole percents. Rupees only exist at the moment of formatting.

This is the oldest advice in financial software and it's still the one most often skipped on a marketing page, because "it's only an estimate." But floating-point drift is exactly what makes an estimate impossible to check by hand: the worksheet says one thing, the headline says another, and they differ by a rupee nobody can explain. With integers, every rounding step is a decision someone wrote down. Estimated orders are revenue divided by the assumed order value, *rounded down*, and the page says "rounded down" next to it.

## 2. One engine is authoritative, and the mirror is pinned to it

The slider has to respond instantly, so the math runs in the browser. The audit a visitor receives afterwards is produced by the backend. Two implementations of the same formula is how you end up emailing someone a different number from the one they just saw.

The answer isn't to pretend there's one implementation. It's to say which one wins:

- The backend engine is the **source of truth**.
- The browser version is a **faithful mirror**: same constants, same order of operations, same rounding.
- The constants are named, exported and commented as a pair: change an assumption in one place and the comment tells you where the other one lives. Tests pin the figures on each side, the worked example in the mirror and the assumed order value against the disclaimer text in the backend, so a silent change fails a build instead of reaching a founder's inbox.

It's the same shape as the trust boundary from yesterday's post. The browser is allowed to be fast. It isn't allowed to be the authority.

## 3. Show the workings, and make them reconcile

A headline figure like "₹1.7L a month" is a compact rounding. Compact rounding is fine for a headline and useless for checking. So underneath it the calculator prints the full worksheet in exact rupees:

```
₹25,00,000 revenue ÷ ₹1,500 assumed AOV = 1,666 estimated orders, rounded down
1,000 estimated COD orders × 20% RTO      = 200 returns
200 returns × ₹220 assumed cost           = ₹44,000 / month
```

The engine returns those intermediate values as a first-class `workings` object, not as strings assembled in the UI. That matters for two reasons. The UI can't drift from the math, because it only renders what the engine computed. And the test suite can assert the thing a sceptical reader would check: that the parts add up to the total.

```ts
assert.equal(
  audit.monthlyRecoverablePaise,
  audit.workings.monthlyRtoCostPaise + audit.workings.monthlyAdScenarioPaise,
);
```

There's a separate formatter for exact amounts precisely so the worksheet never inherits the headline's abbreviation. A test covers that too: the values an abbreviation would hide have to survive.

## 4. Call an assumption an assumption

The calculator needs numbers it doesn't have: an average order value, a cost per returned order, a reference level of ad spend. The honest name for those is *illustrative scenario assumptions*. They're not industry benchmarks, and the code says so in a comment directly above the constants.

That wording carries through to everything the visitor reads:

- The RTO line is labelled **modeled** freight and handling, "not verified savings."
- The ad-spend line applies a stated reduction to spend above a stated reference, and adds that this "does not establish that the spend is wasteful."
- The total is a *scenario*, and the annual figure is explicitly "× 12 unchanged months."

The edge cases are part of this honesty, and they're tested. Ad spend below the reference never produces a negative number that quietly offsets the RTO line. Zero revenue produces no scenario at all, whatever the sliders say. Percentages are clamped. A calculator that returns a confident figure for nonsense input is making a claim it can't support.

## 5. Evidence and arithmetic don't mix

The landing page also cites published industry figures, things like COD share and RTO rates reported by Indian logistics and commerce platforms. Those live in a separate module with their own discipline: each one records its publisher, period, the exact section or page it came from, what the source supports, and its limitations (platform cohort, undisclosed sample size, a year that was inferred rather than stated). The "checked on" date is a manual review date and is never advanced automatically.

The important rule is the wall between the two. **Published statistics never seed the calculator.** A platform reporting a 26% RTO rate for its cohort isn't a default for your business, so it isn't a default in the sliders. Citations give context; the calculator computes from what the visitor entered plus assumptions it names. Mixing them is how a marketing page turns someone else's cohort into a promise about yours.

The same wall applies to diagnosis. When a visitor answers the short questionnaire, the browser holds only labels and stable identifiers. Scoring weights and ranking live on the backend, so the browser can never become an alternate source of scoring truth, and the result is presented as ranked hypotheses that need connected data to verify.

## The general principle

None of this is specific to treasury software:

1. **Represent the quantity exactly**, and make every rounding step a visible decision.
2. **If there are two implementations, name the authority** and pin the mirror to it with tests.
3. **Return workings, not just answers**, so both the UI and the tests can show that the parts reconcile.
4. **Name assumptions as assumptions** in the code and in the copy, and test the inputs where the model has nothing to say.
5. **Keep cited evidence out of the arithmetic.**

An LLM guardrail and a paise-denominated slider look like they belong to different worlds. They're the same decision made twice: the system only says what it can show its working for.
