---
title: "The 200ms You Can't See: Profiling Latency in LLM Document Pipelines"
seoTitle: "Profiling Latency in LLM Document Pipelines | Hitarth Desai"
description: "When a document pipeline feels slow, everyone blames the model. Usually the model is the fastest part. A field guide to the latency hiding in orchestration — queuing, batching, validation, serialization — and how to find it."
excerpt: "When an LLM pipeline feels slow, everyone blames the model. Usually the model is the fastest part. The latency is hiding in the orchestration layer — and it's measurable if you instrument the right seams."
slug: profiling-latency-llm-document-pipelines
date: 2026-07-02
tags:
  - MLOps
  - latency
  - observability
  - LLM pipelines
  - batching
  - document processing
  - AI systems engineering
canonical: https://hitarthdesai.com/blog/profiling-latency-llm-document-pipelines/
---

When a document pipeline feels slow, the first suspect is always the model. It's the biggest, most expensive, most mysterious component, so it must be the bottleneck. Usually it isn't. In a well-fed pipeline the model inference is often the *fastest, most predictable* stage. The latency is hiding in the plumbing around it — and because it's spread across a dozen small steps, no single flame graph screams.

This is a field guide to finding it.

## The anatomy of a "slow" request

Trace a single document end to end and the wall-clock time usually decomposes into stages that have nothing to do with model quality:

- **Ingress & pre-processing** — download, OCR, text extraction, chunking.
- **Queue wait** — time the request spends sitting in a queue before anything touches it.
- **Batch assembly** — waiting for a batch window to fill (or timeout) before inference.
- **Inference** — the part everyone measures.
- **Post-processing** — parsing, validation, serialization, the write to the next system.

The model is one box in that chain. When people say "the pipeline is slow," they've almost always measured the whole chain and attributed it to the one box they can name.

## Measure p95 and p99, not the average

The single most useful change most teams can make is to stop reporting mean latency. Averages are dominated by the happy path and hide exactly the tail that hurts users. Report **p95 and p99 per stage**. A pipeline with a great median and a horrifying p99 is a pipeline that's fine in the demo and on fire under load — the tail is where queue waits, retries, and GC pauses live.

## Where the hidden milliseconds actually are

A few repeat offenders, in rough order of how often they surprise people:

- **Queue backpressure.** Under load, requests wait. That wait is real user latency and it's invisible unless you explicitly measure enqueue-to-dequeue time as its own span.
- **Batching windows.** Batching raises throughput and *adds* latency: a request may wait for the batch to fill. That's a deliberate throughput-vs-latency trade — but only if you can see it. (See [Throughput vs. latency](#throughput-is-not-latency) below.)
- **Validation on the hot path.** Validation runs on every record; a heavy layer over a large batch adds up. This is one reason I care which validation library sits there — [msgspec vs Pydantic vs dataclasses](/blog/msgspec-pydantic-dataclasses-llm-validation/) is a latency decision, not just a style one.
- **Serialization.** Encoding/decoding large payloads between services is easy to under-count and easy to fix.
- **Synchronous I/O between stages.** One blocking call in an otherwise async pipeline serializes everything behind it.

## Instrument the seams, not just the stages

The trick is to put spans on the *boundaries* — enqueue, dequeue, batch-open, batch-close, validate-in, validate-out — not only inside the stages. Bottlenecks live in the gaps between components far more often than inside them. If your tracing only covers "inference took X," you've instrumented the part that was never the problem.

## Throughput is not latency

Worth stating plainly because conflating them causes bad decisions: **throughput** is how many documents per second the system clears; **latency** is how long one document waits. Batching and higher concurrency improve throughput and can *worsen* per-request latency. Which one you optimize depends on the product — a nightly bulk job wants throughput; an interactive review tool wants latency. Pick deliberately, and measure the one you actually care about.

## An observability checklist you can copy

- Per-stage p95/p99, not averages.
- Explicit spans for queue wait and batch-assembly wait.
- Validation-in / validation-out timing on the hot path.
- A dashboard that separates throughput from latency.
- Load-test at and beyond expected peak — the tail only shows up under pressure.

None of this is exotic. It's the difference between guessing "it's the model" and *knowing* it was a 200ms queue wait you couldn't see. Most of the reliability and speed work in an LLM pipeline is exactly this: making the invisible parts measurable, then fixing the ones that turn out to matter.
