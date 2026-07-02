# Blog backlog — outlines for future posts

Not loaded by the site (lives outside `blog/`). These are the next posts, one per
1–2 weeks per the cadence guidance. Each is grounded in real work; **do not add
fabricated metrics, benchmarks, or customer stories** when drafting. Fill the
SeerFlow-tagged ones only once real SeerFlow copy exists.

> Cadence matters: publishing these on a steady schedule builds authority;
> dumping them all at once trips Google's scaled-content-abuse policy. Ship one at
> a time.

---

1. **Constrained Decoding vs. Post-hoc Validation: Pick Both, in the Right Order**
   Angle: generation-time constraints and deterministic post-processing solve different halves. Where each wins, why confident-extract sits on the post-hoc side. Terms: JSON Schema, grammar constraints, tool calling, coercion.

2. **Observability for LLM Pipelines: What to Trace and What to Log**
   Angle: the specific spans and metrics that make an LLM pipeline debuggable. Terms: tracing, spans, p95/p99, token accounting, structured logging. Pairs with the latency post.

3. **Dead-Letter Queues for Extraction Failures**
   Angle: what to do with records that fail validation or score low-confidence — capture, triage, replay. Terms: DLQ, replay, idempotency, human-in-the-loop.

4. **Idempotency in Document Pipelines**
   Angle: re-running a failed batch without double-processing; keys, dedup, exactly-once-ish. Terms: idempotency keys, dedup, resumable jobs.

5. **OCR + LLM: The Failure Modes Nobody Warns You About**
   Angle: where OCR noise breaks LLM extraction and how zero-round-trip repair (confident-extract) helps. Terms: OCR, layout, confidence, coercion.

6. **Versioning Your Output Schema Like an API**
   Angle: expand the schema-drift post into a concrete versioning + migration playbook. Terms: schema versioning, migrations, breaking changes, consumers.

7. **LLM-as-Judge: Where It Lies, and How to Keep It Honest**
   Angle: from the synthetic-data post — biases of LLM judges, calibration against human labels. Terms: LLM-as-judge, calibration, bias, ground truth.

8. **Building promptcrucible: Notes on a Multi-Agent Prompt-Optimization Workbench** (build-in-public)
   Angle: honest in-development write-up of promptcrucible's architecture and hard problems. Terms: multi-agent, prompt optimization, eval harness, orchestration. (Keep "in development" framing.)

9. **Batching Strategies for LLM Inference (and Their Failure Modes)**
   Angle: static vs dynamic vs continuous batching, the latency they add, when each backfires. Terms: continuous batching, vLLM, throughput, latency budget.

10. **From Notebook to Service: Productionizing an Extraction Model**
    Angle: the checklist that turns a working notebook into a service that survives traffic. Terms: packaging, serving, config, rollout. Recruiter-friendly narrative.

11. **Cost, Latency, Throughput: Picking Two**
    Angle: the three-way tradeoff in LLM systems and how to reason about it per workload. Terms: cost/token, batching, caching, SLOs.

12. **Why the Reliability Layer Is the Moat, Not the Model**
    Angle: thesis piece — everyone has the same models; the durable advantage is the systems engineering around them. Ties confident-extract + InfraDock work together. (SeerFlow: fold in here once copy exists.)

13. **SeerFlow deep-dive** — *blocked: needs real SeerFlow facts before drafting.*
