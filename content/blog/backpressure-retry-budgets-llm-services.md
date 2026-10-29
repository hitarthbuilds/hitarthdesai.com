---
title: "Backpressure and Retry Budgets for LLM Services"
seoTitle: "Backpressure & Retry Budgets for LLM Services | Hitarth Desai"
description: "LLM calls are slow, rate-limited, and failure-prone, which makes naive retries and unbounded queues dangerous. How to apply backpressure and retry budgets so an LLM service degrades gracefully instead of collapsing."
excerpt: "LLM calls are slow, rate-limited, and fail in bursts — the exact conditions under which naive retries and unbounded queues turn a bad minute into an outage. Here's how to make an LLM service degrade gracefully."
slug: backpressure-retry-budgets-llm-services
date: 2026-07-02
tags:
  - MLOps
  - distributed systems
  - reliability
  - LLM pipelines
  - backpressure
  - AI systems engineering
  - production AI
canonical: https://hitarthdesai.com/blog/backpressure-retry-budgets-llm-services/
---

LLM calls have a nasty combination of properties for a systems engineer: they're slow (hundreds of ms to seconds), rate-limited by the provider, expensive per token, and they fail in correlated bursts rather than independently. Any one of those is manageable. Together they make two of the most common reliability reflexes — "retry on failure" and "queue the overflow" — actively dangerous if you apply them naively.

## Why naive retries make outages worse

The instinct when a call fails is to retry it. But LLM failures cluster: when the provider is rate-limiting or degraded, *many* requests fail at once. If each one retries immediately, you've just multiplied your load against a system that's already struggling. That's a retry storm, and it turns a brief blip into a self-inflicted outage — you DDoS your own dependency at the worst possible moment.

The fixes are old and well-proven; LLM services just make them non-optional:

- **Exponential backoff with jitter.** Back off increasingly on repeated failure, and randomize the delay so retries don't synchronize into waves.
- **A retry *budget*, not a retry count.** Cap retries as a *fraction of total traffic* (say, retries may not exceed 10% of requests), not just per-request attempts. When the budget is exhausted, stop retrying and shed load. This bounds the blast radius of a bad dependency.
- **Circuit breakers.** When failure rates cross a threshold, trip the breaker and fail fast for a cooldown instead of hammering a down service. Fast failure you can handle beats slow failure you can't.

## Why unbounded queues are a trap

The other reflex is to absorb a load spike by queueing. Queues are essential — but an *unbounded* queue doesn't prevent failure, it defers and disguises it. Under sustained overload the queue grows without limit, latency climbs toward infinity, memory balloons, and every request that entered the queue is already too stale to be useful by the time it's served. You've traded a fast, honest rejection for a slow, expensive one.

**Backpressure** is the discipline of pushing "slow down" back to the caller instead of silently hoarding work:

- **Bound your queues.** A full queue should reject new work (a fast, clear 429/"try later"), not grow forever. A bounded queue that sheds load is more available than an unbounded one that melts.
- **Propagate the signal upstream.** When you're near capacity, tell callers — via rejection, a `Retry-After`, or a rate signal — so the pressure stops at the edge instead of pooling in the middle.
- **Deadline everything.** Attach a deadline to each request and drop work that's already exceeded it. Serving a response nobody's waiting for anymore is pure waste. (This ties directly into where [pipeline latency actually accumulates](/blog/profiling-latency-llm-document-pipelines/).)

## Graceful degradation is a feature you design

The goal isn't "never fail" — at sufficient load, everything fails. The goal is to fail in a controlled, predictable, recoverable way. That's a property you design in, not something you hope for:

- **Shed load deliberately.** Under pressure, drop or defer the lowest-value work first (batch jobs before interactive requests) so the system stays up for what matters.
- **Have a fallback path.** A cached result, a cheaper/smaller model, or an honest "we couldn't process this, try again" beats a hung request every time.
- **Make failures idempotent and resumable.** If a batch dies, you should be able to re-run it without double-processing. Idempotency turns a scary partial failure into a boring retry.

## The mindset

Treat the LLM as an unreliable, rate-limited remote dependency — because that's exactly what it is — and the whole reliability picture snaps into focus. These aren't AI-specific tricks; they're the distributed-systems fundamentals (backoff, budgets, breakers, backpressure, deadlines) applied to a component that happens to be a model. The teams that ship LLM products that stay up aren't the ones with the best prompts. They're the ones who assumed the model would fail under load and built a system that shrugs it off.
