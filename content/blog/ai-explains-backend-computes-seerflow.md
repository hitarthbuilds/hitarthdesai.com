---
title: "AI Explains, Backend Computes: The Guardrail Architecture I'm Building Into SeerFlow"
seoTitle: "AI Explains, Backend Computes — SeerFlow's Guardrail Architecture | Hitarth Desai"
description: "How SeerFlow, an AI treasury and cash-flow intelligence platform for Indian D2C brands, keeps LLMs from touching financial truth: deterministic services own the numbers, AI only explains them, and a numeric guardrail enforces the boundary."
excerpt: "I'm building SeerFlow, a cash-flow intelligence platform for Indian D2C brands. Its strictest rule has nothing to do with models and everything to do with trust: AI explains, the backend computes, and a guardrail rejects any AI output that invents a number."
slug: ai-explains-backend-computes-seerflow
date: 2026-07-02
tags:
  - SeerFlow
  - AI systems engineering
  - LLM guardrails
  - fintech
  - production AI
  - structured outputs
  - MLOps
canonical: https://hitarthdesai.com/blog/ai-explains-backend-computes-seerflow/
---

I'm building [SeerFlow](https://seerflow.in), an AI treasury and cash-flow intelligence platform for Indian D2C brands. The problem space is unglamorous and brutal: cash-on-delivery delays, RTO exposure, settlement confusion across marketplaces and payment providers, GST obligations, and a founder who just wants to answer one question — *will I have enough money next week?*

It's an "AI product" in the sense people expect in 2026. But the most important architectural decision in it is a restriction, not a capability:

**AI explains. The backend computes. Deterministic services own financial truth.**

No LLM in SeerFlow ever produces a financial number. Not a forecast, not a balance, not a fee. Every figure a user sees comes from deterministic, auditable services — provider ingestion, reconciliation, forecasting — that can be replayed and tested. The AI layer sits *on top* of those numbers and does the one thing LLMs are genuinely great at: explaining them in plain language.

## Why be this strict?

Because the failure mode of a probabilistic model in a financial product isn't an awkward answer — it's a fabricated number that looks exactly like a real one. A founder making a payroll decision off a hallucinated cash position is a catastrophic outcome, and no amount of "the model is usually right" makes it acceptable.

This is the same lesson that drives [`confident-extract`](https://pypi.org/project/confident-extract/) and everything I've written about [deterministic structured outputs](/blog/deterministic-structured-outputs-production-llm-pipelines/): the boundary between a probabilistic component and a system people rely on must be deterministic, enforceable, and allowed to say no. In an extraction pipeline that boundary is a schema validator. In a treasury product, it's the rule that models never originate numbers at all.

## The guardrail, concretely

Saying "the AI only explains" is easy; enforcing it is engineering. SeerFlow's insight endpoints run the model's output through a **numeric guardrail** before anything reaches a user:

- The deterministic services produce the forecast or reconciliation result — the set of legitimate figures.
- The LLM (a provider chain with fallbacks) drafts a natural-language explanation of those figures.
- The guardrail then checks the draft against the deterministic input. **Any AI output that introduces a financial figure not present in the input is rejected.** Benign transformations are allowed — unit conversions like paise to rupees, summing components the input already contains — but a novel number is an automatic fail.
- On rejection, the system falls back to a deterministic template. The endpoint never fails open, and it never ships an invented figure.

The same discipline extends to SeerFlow's grounded chat assistant: it answers questions about cash, RTO, and settlements using only the brand's real computed numbers, behind the same guardrail. If the model can't ground an answer in the deterministic data, the user gets an honest fallback — not an improvisation.

## Where the actual ML lives

None of this means "no models." SeerFlow runs real ML where prediction is the job and the output is *scored, not trusted blindly*: a calibrated gradient-boosting classifier for shipment-level RTO risk, a settlement-delay regressor per provider, and isolation-forest anomaly detection for fee spikes, duplicate remittances, and payout delays. Those models version their artifacts, persist evaluation metrics, and run on immutable feature snapshots so every inference is replayable.

Notice the pattern: the ML models are *inputs* to the deterministic layer — risk scores and anomaly flags with known calibration — not free-text authorities. The LLM is an *output* of it — an explainer. The deterministic core sits in the middle and owns the truth. Probabilistic components on both sides, determinism at the center.

## The general principle

Strip away the treasury specifics and the architecture generalizes to any serious LLM product:

1. **Decide what your system's "truth" is, and compute it deterministically.** Financial figures, extraction results, eligibility decisions — whatever users will act on.
2. **Let models predict and explain around that truth,** where their failure mode is acceptable.
3. **Enforce the boundary mechanically.** A guardrail that inspects outputs and rejects violations, with a deterministic fallback — not a prompt that politely asks the model to behave.

Prompts are requests. Guardrails are guarantees. Users don't experience your model; they experience your system — and a system that can prove where every number came from is a fundamentally different product from one that hopes the model was right.

SeerFlow is in active development, and I'll write more as it matures — the reconciliation engine and the provider-ingestion layer each deserve their own post. But the invariant above was decided before any of it, and it's the reason the rest is buildable at all: once the backend owns the truth, the AI can be as helpful as it likes without being trusted an inch further than it deserves.
