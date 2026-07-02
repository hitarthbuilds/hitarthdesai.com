---
title: "Zero Round-Trips: Cleaning Noisy LLM and OCR Output Without Calling Another Model"
seoTitle: "Zero-Round-Trip Extraction from Noisy LLM & OCR Output | Hitarth Desai"
description: "Why sending a bad LLM response back to an LLM to 'fix it' is an anti-pattern, and how confident-extract v0.1.0 does deterministic structured extraction from noisy model and OCR output with zero extra round-trips."
excerpt: "The common fix for a malformed LLM response is to send it back to the model to repair. That's a latency, cost, and reliability tax you don't need to pay. Here's the zero-round-trip approach behind confident-extract v0.1.0."
slug: zero-round-trip-extraction-noisy-llm-ocr-output
date: 2026-07-02
tags:
  - structured outputs
  - confident-extract
  - OCR
  - LLM pipelines
  - AI systems engineering
  - latency
  - production AI
canonical: https://hitarthdesai.com/blog/zero-round-trip-extraction-noisy-llm-ocr-output/
---

When an LLM returns something that doesn't parse, the reflex fix has become "ask the model to fix it." You catch the error, wrap the broken output in a new prompt — *"the previous JSON was invalid, please correct it"* — and fire off another call. It works often enough to feel fine in development.

In production it's a tax you pay forever. Every repair round-trip adds a full model latency to that record, doubles (or triples) its token cost, and — this is the part people miss — it's *non-deterministic*. You're fixing a probabilistic failure with another probabilistic call. Sometimes the "fix" introduces a new, subtler error that now parses cleanly and sails straight into your database.

## The failure is usually mechanical

Look at what actually breaks in a malformed response and most of it is mechanical, not semantic: a trailing comma, a markdown code fence wrapped around the JSON, smart quotes, a number rendered as `"1,240.00"`, a date in three different formats across three records, a field the model narrated instead of populating. OCR output has the same character: `l` vs `1`, `O` vs `0`, a decimal point that became a comma, a column that wrapped.

You don't need a billion-parameter model to repair that. You need deterministic code that understands the target types and coerces toward them — or rejects. This is exactly what [`confident-extract`](https://pypi.org/project/confident-extract/) v0.1.0 does: deterministic structured extraction from noisy LLM and OCR output, with **zero LLM round-trips** and microsecond-level latency. The messy output goes in, typed data comes out, and no second model call happens.

## Determinism is the feature

The reason zero round-trips matters isn't only speed and cost — though at scale both are real. It's that a deterministic repair step is *reproducible*. Given the same noisy input, you get the same typed output, every time. You can unit-test it. You can diff its behavior across versions. You can reason about it. A repair-by-LLM step has none of those properties; it's a second stochastic dice roll bolted onto the first.

That doesn't mean the model is optional — it produced the content. It means the *boundary* between the model and your systems should be deterministic. Generate with the model; convert and validate with code.

## Know what you couldn't fix

Deterministic doesn't mean "always succeeds." Some inputs are genuinely ambiguous, and pretending otherwise is how silent-corruption bugs are born. That's why `confident-extract` attaches a **confidence score to every result**: instead of a binary parse/throw, you get typed data plus a signal for how sure the extraction is. High-confidence records flow straight through; low-confidence ones get routed to human review or a dead-letter path. (I go deeper on that in [Put a Confidence Score on Every Extraction](/blog/confidence-scores-llm-extraction/).)

That single design choice changes the operational posture of a pipeline. You stop choosing between "trust everything" and "review everything" and start triaging by confidence — which is the only version of this that scales.

## Where it fits

Zero-round-trip extraction isn't the whole pipeline; it's the boundary. Upstream, you still constrain generation where you can and version your schemas. Downstream, you still need retry budgets, backpressure, and observability. But the moment where noisy text becomes typed data should be fast, deterministic, and honest about its own uncertainty — not another trip through a model, hoping the second roll lands better than the first.

It targets the types you already use — `msgspec`, Pydantic v2, or dataclasses — so adopting it is a boundary change, not a rewrite. If you're running document or extraction pipelines and your reliability strategy currently includes the phrase "ask the model to try again," it's worth an afternoon to try the deterministic version instead.
