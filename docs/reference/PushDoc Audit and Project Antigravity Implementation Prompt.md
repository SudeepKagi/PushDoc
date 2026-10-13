# PushDoc Audit and Project Antigravity Implementation Prompt

Oct 13, 2026 · @Sudeep

## Overview and scope

PushDoc's AI layer is held back less by an outdated stack than by silent failures and missing repair loops, so the rewrite should fix those first. PushDoc is a GitHub App: it clones a repo, extracts facts by static analysis, and has an LLM write the README. It is not a general document-ingestion RAG app, so "document types" here means languages and ecosystems.

- **Reviewed:** AI, retrieval, embedding, pipeline, worker, queue, config, webhook, reader and validator code in full; analyzers and the prompt builder partially.
- **Not done:** the React client was not audited, the test suite was not run, and no live provider API was called.

Part 1 is the audit and target architecture. Part 2 is the Project Antigravity prompt, written to be fed to a coding LLM one phase at a time.

## Part 1.1 — Audit findings

Four defects can break or corrupt output today (P0); the rest cost latency, generalization or observability.

Two findings rest on Google's published status, from its [deprecation page](https://ai.google.dev/gemini-api/docs/deprecations.md) (last updated October 9, 2026). It lists text-embedding-004 as shut down on January 14, 2026, with gemini-embedding-2 as the replacement. For gemini-2.5-flash it lists no shutdown date, but says access to 2.5 models is now limited to users who have used them before. Earlier dates (June 17 and October 16, 2026) appear in a [Google AI forum thread](https://discuss.ai.google.dev/t/gemini-2-5-flash-deprecated-without-warning-earlier-than-shutdown-date/174217), which also records an accidental 404 on July 9 that Google rolled back; treat those dates as superseded. Check the live page before pinning any model.

| # | Severity | Location | Problem and impact |
| --- | --- | --- | --- |
| 1 | P0 | embedding.service.js, retrieval.service.js | Uses the retired text-embedding-004. Errors are swallowed (catch returns null), so the index comes back empty and retrieval returns nothing. The raw-source fallback only fires on a thrown error, which never happens, so repos over 40 files may reach the LLM with facts but no source. Inferred from the code; the live API was not called. |
| 2 | P0 | ai.utils.js, ai.manager.js | Fallback to Groq triggers only on strings like 429, quota, 503 or timeout. A 404 (model gone or refused), MAX\_TOKENS or a safety block is treated as non-retryable and fails the job without trying Groq. BullMQ then retries the same failure 3 times. |
| 3 | P0 | validator.service.js | A global replace collapses double spaces across the whole README, including code fences. Tested: YAML indentation is destroyed and tree diagrams are flattened. PushDoc's own README project tree shows the damage. |
| 4 | P0 | readme.pipeline.js, readme.worker.js, critic.js | The critic and structural validator only log. Whatever the model produced is pushed straight to the branch. Groq's finish\_reason "length" is accepted as success, so truncated READMEs can ship. No max output tokens is set. |
| 5 | P1 | gemini.provider.js, ai.config.js, app.config.js | gemini-2.5-flash is hard-coded in 3 places with no startup check that the model is still served. Google now limits 2.5 models to users who have used them before, so a new key or project can be refused, and finding 2 means that refusal fails the job instead of falling back. |
| 6 | P1 | critic.js, worker badge | The "PushDoc Quality 80/100" badge is 100 minus 5 per regex mismatch, which is not a quality measure. The critic is JS-centric: the package check is skipped when no packages are known, and the route check only knows api, auth, versioned, admin, webhook and oauth prefixes. |
| 7 | P1 | embedding.service.js | The first 25 chunks are taken in file order after the centrality ranking, so in practice often only the first few files are embedded. Retrieval uses one fixed query, and chunks are fixed 40-line windows that ignore code structure. |
| 8 | P1 | file.reader.js, ignore.rules.js | Files are capped at 300 lines, 12k characters and 50 KB, silently. The largest files can become a placeholder string that then gets embedded. The ignore list misses venv, **pycache**, target and vendor, yet skips build, logs and temp. Language detection knows 12 extensions. |
| 9 | P1 | prompt.builder.js, providers | One monolithic prompt of up to about 160k characters goes in a single non-streaming call. Gemini has no temperature or token cap. Groq free-tier token limits are likely hit on large prompts (not tested). |
| 10 | P1 | ai.manager.js | When the circuit breaker is open, the code calls the provider directly anyway, defeating the breaker. Keys are looped sequentially inside it. |
| 11 | P1 | render.yaml, server.js | With SEPARATE\_WORKER=false the worker runs inside the web process. On a free plan that means CPU contention, and idle spin-down delays jobs. |
| 12 | P2 | readme.worker.js | It reads a metrics object the pipeline never returns, so "Total: 0ms" is always logged and there is no per-stage latency data. |
| 13 | P2 | worker.js | The SIGTERM handler exits immediately without closing the worker, so deploys abandon in-flight jobs. |
| 14 | P2 | embedding.service.js | The cache key is SHA1 of the content with no model or dimension, so changing models poisons the cache. Vectors are stored as JSON text. |
| 15 | P2 | readers and analyzers | Synchronous file reads block the event loop of the process that also serves HTTP. |

## What to keep

Keep the fact-extraction spine and the GitHub plumbing; replace the retrieval, model and verification layers.

- The deterministic facts extractor, architecture graph and Mermaid renderer, with their golden tests. This is the strongest part, and the new pipeline builds on it.
- The truth-hierarchy prompt idea: verified facts as the hard boundary of what the model may state.
- Webhook idempotency and the bot-commit loop guard.
- Token redaction in git errors and the path-traversal guard.
- The BullMQ queue, Mongo models and GitHub App auth.

## Part 1.2 — Target architecture

Keep the deterministic facts as the backbone and make every LLM call narrow, structured, verifiable and repairable.

&#91;embedded content: architecture · two planes, one verify-and-repair loop\]

Node stays the control plane and sends facts plus a repo snapshot to a Python LangGraph service. Retrieve, Draft, Verify and Repair run per section, in parallel; a section that fails verification twice falls back to a facts-only template, so violating text never ships.

- **Semantic routing:** repo type (API, frontend, library, CLI, ML, monorepo) selects the section plan. Install, scripts, env table and API table render from templates with no LLM.
- **Retrieval:** AST-aware chunks (tree-sitter), multi-query expansion, dense plus BM25 fused with RRF, then a reranker. The index is content-addressed by blob SHA and model ID.
- **Resilience:** a checkpointer keyed by job ID lets a retried job resume mid-graph; a 120 s deadline ends in a template-only README rather than a failure.
- **Integrity:** Markdown-AST validation, claims must cite evidence IDs, and the default delivery is a PR, not a direct push.

## Recommended models

Use Qwen3-Embedding-0.6B for embeddings and keep every model ID in config, because provider catalogs change under you. An [independent embedding ranking (August 2026)](https://theairankings.com/best-embedding-models/) names Qwen3-Embedding-8B the best all-round open model; the 4B and 8B sizes need a GPU, so start with 0.6B. A free-tier web instance cannot host even the 0.6B model comfortably, so begin with hosted inference (Hugging Face Inference Providers or Endpoints) rather than self-hosting.

| Role | Primary pick | Alternatives | Note |
| --- | --- | --- | --- |
| Embeddings | Qwen3-Embedding-0.6B (1024-d, Apache-2.0) | BGE-M3 (dense plus sparse), EmbeddingGemma-300M for tiny CPU budgets | Qwen3 needs an instruction prefix on queries; benchmark two candidates on your own repos |
| Reranker | bge-reranker-v2-m3 | Qwen3-Reranker-0.6B | Cuts context size and improves precision |
| Section drafting | Qwen3-Coder-30B-A3B-Instruct | Groq Llama 3.3 70B, current Gemini Flash as fallbacks | Confirm availability on your provider before pinning |
| Planner and judge | Same family as drafter, temperature 0 | A larger model for hard repos | Only if latency allows |

## Part 2 — Antigravity prompt: rules, current system, architecture

Feed Part 2 to the coding LLM in order, one phase per session; every phase ends with a stop-and-report. This first block covers the role, rules, current-system map and target architecture.

### 0. Role and operating rules

You are a principal engineer executing a staged rewrite of the AI layer of PushDoc (github.com/SudeepKagi/PushDoc: Node 22, Express 5, BullMQ, MongoDB, Redis; a GitHub App that clones a repo, extracts facts via static analysis, and generates README.md).

Work strictly in phases. After each phase STOP and output: (a) files created or changed, (b) commands to run tests, (c) acceptance results, (d) assumptions made, (e) the next phase. Do not ask questions unless blocked; state assumptions instead.

Hard rules:

1. Library APIs drift. Before writing code against LangChain, LangGraph, langchain-huggingface, sentence-transformers, HF TEI clients, tree-sitter, LanceDB or FastAPI, check the installed or latest stable version and read its current docs. Do not write from memory. Pin exact versions and record them in docs/DECISIONS.md.
2. No model ID is hard-coded in code. All models live in config/models.yaml with env overrides.
3. Never swallow exceptions. No bare except, no empty catch. Every failure is classified (section 6 of the prompt) and is retried, fallen back, degraded with a flag in the report, or fatal.
4. Never regex-rewrite a whole Markdown document. Use a Markdown AST (markdown-it-py).
5. Never push unverified README content to a default branch.
6. Strangler pattern: Node stays the control plane. Do not rewrite the analyzers, GitHub App auth, webhooks, queue, Mongo models or React client. Keep all existing tests green; port tests, do not delete them.
7. Everything I/O-bound is async with explicit timeouts, concurrency limits and cancellation.

### 1. Current system: keep, replace, fix

- **KEEP:** OAuth and GitHub App auth, webhook idempotency and bot-commit guard, BullMQ queue, Mongo models, clone/commit/push with token redaction, analyzers/\* (facts extractor, architecture graph, mermaid renderer, ecosystem plugins) and their golden tests, React client.
- **REPLACE:** services/embedding.service.js, services/retrieval.service.js, managers/ai.manager.js, providers/\*, builders/prompt.builder.js (monolithic prompt), analyzers/critic.js (advisory only), services/validator.service.js (regex sanitizer), the RAG branch of repositoryContext.builder.js.

Known defects to fix first (Phase 0):

1. embedding.service.js and retrieval.service.js use the retired text-embedding-004; errors are swallowed so retrieval silently returns nothing and the raw-source fallback never fires.
2. ai.utils.js shouldRetry matches only 429, quota, 503 and timeout strings; 404, MAX\_TOKENS and safety blocks skip the Groq fallback and fail the job.
3. gemini-2.5-flash is hard-coded in gemini.provider.js, ai.config.js and app.config.js ; Google now limits 2.5 access to users who already used it, so a new key or project can be refused. No startup preflight exists.
4. validator.service.js collapses double spaces across the whole README, corrupting code blocks.
5. groq.provider.js treats finish\_reason length as success; Gemini sets no max output tokens.
6. ai.manager.js calls the provider directly when the circuit breaker is open.
7. readme.pipeline.js never returns metrics, but readme.worker.js reads them (always 0 ms).
8. embedding.service.js takes the first 25 chunks in file order after centrality ranking.
9. worker.js SIGTERM handler exits without awaiting worker.close().
10. ignore.rules.js lacks venv, **pycache**, target, vendor and .venv; file.reader.js truncates silently at 300 lines, 12k characters and 50 KB.
11. The embedding cache key is SHA1 of content only (no model or dimension) and stores JSON text.

### 2. Target architecture

Node control plane (existing) calls the Python AI service "pushdoc-ai" (new) over HTTP.

Node worker flow (modified): clone, readRepository, analyzeRepository, extractFacts, architecture mermaid, POST snapshot and facts to pushdoc-ai, poll or SSE for the result, gate, then PR (default) or commit. A feature flag AI\_BACKEND takes legacy, shadow or antigravity; in shadow mode run both, store both outputs and the new report, and ship only legacy.

Folder structure of pushdoc-ai:

```text
pushdoc-ai/
  pyproject.toml                 (pinned deps)
  config/models.yaml             (roles -> model ids, providers, limits, fallbacks)
  config/sections/<repo_type>/*.yaml   (section plans)
  src/pushdoc_ai/
    api/        main.py routes.py schemas.py sse.py auth.py
    core/       config.py errors.py logging.py telemetry.py limits.py
    models/     registry.py chat.py embeddings.py rerank.py fallbacks.py preflight.py
    ingest/     snapshot.py filters.py language.py chunking.py
    retrieval/  index.py hybrid.py rerank.py query_expansion.py cache.py
    graph/      state.py builder.py checkpoint.py edges.py
                nodes/ classify.py plan.py retrieve.py draft.py verify.py repair.py
                       assemble.py finalize.py
    verify/     markdown_ast.py grounding.py links.py scoring.py
    prompts/    *.jinja (versioned, one file per node/section)
    eval/       golden/ run_eval.py metrics.py
  tests/        unit/ integration/ chaos/ golden/
  Dockerfile  docker-compose.yml (service + redis + node api for local e2e)
```

API contract (JSON, service-token auth, max payload 25 MB):

- POST /v1/readme-jobs takes job\_id, repo (full\_name, default\_branch, commit\_sha), facts, architecture\_mermaid, optional existing\_readme, and a snapshot tar.gz upload. It returns 202 with job\_id.
- GET /v1/readme-jobs/{id} returns status, readme\_markdown and report.
- GET /v1/readme-jobs/{id}/events streams SSE of node start, finish and degraded events.
- GET /healthz and /readyz; readyz fails if model preflight failed.
- The report holds gate\_passed, groundedness, violations, per\_section, degraded\_flags, truncated\_files, latency\_ms\_per\_node, model\_ids\_used and cache\_hit\_rate.

## Part 2 — Antigravity prompt: phases 0–3

Phase 0 ships independently as a Node hotfix; phases 1–3 build the Python model, ingest and retrieval layers.

### Phase 0 — Baseline and hotfixes (Node)

- Create a golden corpus of at least 10 repos: Express API, FastAPI, Spring Boot, Go service, Next.js app, React SPA, CLI tool, library, monorepo, ML project. Record current outputs and timings.
- Apply defects 1–11 from section 1: models from config; typed error classification instead of string matching; abort on truncation for ALL providers; set max output tokens and temperature 0.2; never bypass an open breaker (skip to the next provider); remove the global whitespace collapse; return real stage timings; await worker.close() on SIGTERM; remove the take-first-25-before-ranking bug; surface embedding failure and trigger the raw-source fallback; extend ignore rules; include model ID and dimension in the cache key.
- Add a test for each fix, including a code-fence integrity test and a test that a 404 triggers the fallback.

**Acceptance:** all old tests pass; new regression tests pass; a corpus run produces timings.

### Phase 1 — Model layer (pushdoc\_ai/models)

- registry.py loads config/models.yaml with roles planner, drafter, judge, embedder and reranker, each with a primary, ordered fallbacks, timeout, max\_tokens, temperature and rate limits.
- chat.py builds LangChain chat models (OpenAI-compatible endpoint for HF Inference Providers or vLLM; langchain-huggingface where appropriate; Groq and Gemini as fallbacks) composed with with\_fallbacks(), using the error taxonomy to decide what triggers a fallback.
- embeddings.py is an async client for HF TEI or HF Inference Providers feature-extraction: batch size 32, at most 4 concurrent requests, 15 s timeout, tenacity retries with jitter, L2 normalisation, per-model query and document instruction prefixes (Qwen3-Embedding needs an instruction on queries; others do not), configurable Matryoshka dimension.
- rerank.py is a cross-encoder reranker client with the same resilience wrapper.
- preflight.py runs at startup and in CI: send a tiny request to every configured model (primary and fallbacks) and fail readiness if any returns 404, 410 or unavailable.
- ProviderPool does key rotation with health scoring and a token-bucket rate limiter per provider and key, replacing nested for-loops. One circuit breaker per provider, never bypassed.

**Acceptance:** chaos tests inject 404, 429, 5xx, timeout, truncation and empty output; the fallback chain behaves per the taxonomy; no unclassified exception escapes.

### Phase 2 — Ingest and chunking (pushdoc\_ai/ingest)

- snapshot.py: safe tar extraction (reject path traversal, symlinks, oversize); honour .gitignore plus default ignores (node\_modules, venv, .venv, **pycache**, target, vendor, dist, build artefacts detected by content, lockfiles, binaries, minified or generated files).
- language.py: detect by extension, shebang and manifest; never default to "Text" silently; record unknown types in the report.
- chunking.py: tree-sitter (verify the maintained package) to chunk by symbol (function, class, method). Split symbols above about 512 tokens with 64-token overlap. Prefix each chunk with path, language and symbol. Markdown, YAML, JSON and TOML use structure-aware splitters. Fall back to LangChain's language-aware recursive splitter.
- Never truncate silently. If a file exceeds budget, keep a signature outline plus retrieved symbols and record it in report.truncated\_files.

**Acceptance:** chunking works on all corpus languages; no chunk crosses a symbol boundary unless oversized; property tests show concatenated chunks reproduce symbol text.

### Phase 3 — Retrieval (pushdoc\_ai/retrieval)

- index.py is content-addressed by repo\_id, blob\_sha, chunker\_version, embed\_model\_id and dimension, so only changed blobs are re-embedded. Start with embedded LanceDB per job plus an external vector cache (Redis, float16 bytes, not JSON). Document how to move to pgvector or Qdrant.
- hybrid.py: dense top-30 plus BM25 top-30, Reciprocal Rank Fusion (k=60), rerank to top-12, MMR de-duplication, then token-budget packing with at most 3 chunks per file.
- query\_expansion.py: per section, deterministic queries from facts (route names, models, env vars) plus up to 3 LLM paraphrases from the cheap model, cached by section and facts hash.
- If embeddings are unavailable, degrade to BM25-only and set degraded\_flags to no\_dense.

**Acceptance:** recall@8 on a hand-labelled set (key files per section for each corpus repo) beats the legacy approach; a second run on an unchanged repo has a cache hit rate of at least 80%.

## Part 2 — Antigravity prompt: phases 4–6

These phases build the LangGraph pipeline, the verify-and-repair loop, and the service plus Node integration.

### Phase 4 — LangGraph orchestration (pushdoc\_ai/graph)

State (typed, Pydantic): job, facts, repo\_type, plan, sections (per-section state), retrieval\_cache, violations, degraded\_flags, timings, report.

Nodes:

- **classify\_repo:** deterministic signals from facts first (manifest ecosystem, routes present, React entry, bin entry, Dockerfile, notebooks); an LLM only breaks ties. Output repo\_type and confidence.
- **plan\_sections:** load config/sections/\<repo\_type>; each section declares id, title, required\_facts, retrieval\_queries, render\_mode (template or llm) and max\_tokens.
- **Per section** (fan-out with Send, bounded by a semaphore, default 4 concurrent): retrieve, draft, verify, then repair on failure (max 2), then accept or fall back to the template version.
- **assemble:** deterministic order, generated table of contents, Mermaid block inserted verbatim from Node, badges only for confirmed dependencies.
- **finalize:** global Markdown-AST validation, diff against the existing README, build the report.

Use a checkpointer (SQLite for dev, Postgres for prod; verify class names in current docs) keyed by thread\_id equal to job\_id, so BullMQ retries resume mid-graph. Emit SSE events per node. Set a global job deadline of 120 s: on expiry, finish with the template-only README and a degraded flag rather than failing.

**Acceptance:** graph visual export committed to docs; resume-after-crash test passes.

### Phase 5 — Drafting, verification, repair

- **draft.py:** structured output (a Pydantic SectionDraft with markdown and claims, each claim carrying evidence IDs), temperature 0.1, max\_tokens set, streaming on, 45 s per-node timeout. The prompt receives only the section spec, required facts and packed chunks with IDs. Instruct: every behavioural claim must cite evidence IDs; omit what cannot be supported.
- **verify.py**, deterministic first:
  - Markdown AST checks: balanced fences, language tags, unique headings, valid anchors, relative links that resolve inside the snapshot.
  - Identifier grounding: env vars, routes, packages, scripts and file paths must exist in facts or retrieved chunks. Port the critic.js logic but make it ecosystem-aware, with per-ecosystem tokenisers and no JS-only assumptions.
  - Claims without evidence IDs are marked UNCITED. An optional cheap-LLM entailment check runs only on flagged claims.
  - Severity: BLOCKING (invented identifier, broken fence, uncited behavioural claim) versus WARNING.
- **repair.py:** send only the failing section, its violations and evidence; max 2 loops. If it still fails, replace the offending sentences or the whole section with the facts-only template version. Violating text must never ship.
- Replace the vanity quality-score badge. If kept, make it opt-in and derive it from eval metrics, not regex counts.

**Acceptance:** injected-hallucination tests (fake env var, fake route, fake package, broken fence) are all caught and repaired or dropped; zero corrupted code fences across the corpus.

### Phase 6 — Service and Node integration

- FastAPI async app on uvicorn, service-token auth, request size limits, structured JSON logs with job\_id, OpenTelemetry traces (Langfuse or LangSmith optional via env).
- Node: add services/ai.client.js (undici, timeouts, opossum around the HTTP call, retries only on idempotent GET or poll), the AI\_BACKEND flag, and store the report on the Mongo job.
- Delivery: the default is a PR from branch pushdoc/readme-\<sha7> with the report in the body. Direct commit only if the repo setting autoCommit is true AND report.gate\_passed.
- Keep the webhook bot-commit guard; also ignore pushes whose only change is a README.md authored by the app.

**Acceptance:** an end-to-end docker-compose test goes from webhook to job to a PR created against a fixture repo.

## Part 2 — Antigravity prompt: phases 7–9

These phases tune latency, lock in quality with evals and chaos tests, and roll the new path out safely.

### Phase 7 — Latency engineering

- Fan out sections in parallel, stream tokens, and skip the LLM entirely for template sections.
- Warm model clients and reuse HTTP connections: one client per provider, not per request.
- Cache embeddings, query expansions and section drafts. Draft cache key: section spec hash, evidence hash, prompt version and model ID.
- Remove synchronous fs calls from Node hot paths (fs.promises with bounded concurrency) or run the analyzers in worker\_threads.
- Run the worker as a separate process or service (SEPARATE\_WORKER=true).

Targets (tune against the corpus): p50 at most 30 s and p95 at most 75 s for repos under 500 files; a cache-hit rerun at most 15 s; no event-loop block over 100 ms in the web process.

### Phase 8 — QA, evals, CI

- Unit and property tests for the chunker, RRF, error taxonomy and Markdown AST checks.
- Integration tests with recorded provider responses (VCR-style) and a fake TEI server.
- Chaos tests: 404, 429, 5xx, slow responses, truncation, empty output, Redis down, corrupt vector index, and a snapshot with zip-slip or symlinks.
- Golden regression per corpus repo: required facts present, identifier hallucination count 0, Markdown validity 100%, code fences byte-identical to source samples.
- Quality metrics through an eval framework (RAGAS or DeepEval; verify current APIs): faithfulness, context precision and recall, plus fact recall from facts.json.
- CI: lint (ruff), types (mypy or pyright), tests, model preflight against staging keys, npm audit and pip-audit, container build.

**Acceptance (all required):** zero BLOCKING-class groundedness violations; Markdown validity 100%; job success at least 99% in the chaos suite with one provider down; p95 within target.

### Phase 9 — Rollout

1. Shadow mode on your own repos for a week; compare legacy and new on the report metrics.
2. Enable antigravity per repo via the flag, PR mode first, auto-commit last.
3. Dashboards: job success rate, per-node p50 and p95, fallback rate by provider, degraded-flag rate, cost per job. Alerts: preflight failure, fallback rate above 20%, p95 above target.
4. Write docs/RUNBOOK.md: how to swap a model, rotate keys, rebuild an index and replay a job.

## Part 2 — Antigravity prompt: models, async rules, errors, done

This block closes the prompt with model directives, async rules, the error taxonomy, the definition of done, and the start instruction.

### 4. Model integration directives (config/models.yaml)

- **embedder:** primary Qwen3-Embedding-0.6B via HF Inference Providers or TEI; alternates BGE-M3 and EmbeddingGemma-300M; configurable dimension; query and document prefixes per model.
- **reranker:** bge-reranker-v2-m3; alternate Qwen3-Reranker-0.6B.
- **drafter:** Qwen3-Coder-30B-A3B-Instruct; fallbacks Groq Llama 3.3 70B and the current Gemini Flash.
- **planner and judge:** same family as the drafter, small context, temperature 0.
- Every entry has provider, model\_id, revision, timeout\_s, max\_tokens, rps, tpm and enabled.
- Before pinning any ID, verify it is currently served by that provider and record the date in docs/DECISIONS.md. Benchmark two embedding candidates on the golden retrieval set before choosing the default; do not trust leaderboard numbers alone.

### 5. Async and performance rules

- Use asyncio throughout; no blocking calls in async functions. Run CPU-bound work (tree-sitter, BM25 build) in a process or thread pool.
- Every outbound call has a timeout, a retry policy with jitter, and a concurrency limit.
- Cancellation propagates: cancelling a job cancels in-flight model calls.
- Pass a deadline budget through the graph; nodes shrink their work as the budget shrinks.

### 6. Error taxonomy (core/errors.py)

Classify using HTTP status and SDK exception classes, never message substrings.

| Class | Triggers | Action |
| --- | --- | --- |
| RETRY\_SAME | 429 with Retry-After, 5xx, network reset, timeout | Bounded, jittered retry |
| FALLBACK | 404 or 410 model gone, quota exhausted, MAX\_TOKENS or length, safety block, empty output | Move to the next model or provider |
| DEGRADE | Embeddings unavailable, reranker unavailable, judge unavailable | Continue with BM25 only, skip rerank, or deterministic checks only; add degraded\_flags |
| FATAL\_JOB | Snapshot invalid, auth failure on all providers, deadline exceeded after template fallback also failed | Fail the job with a clear reason |
| FATAL\_CONFIG | Preflight failure, missing keys | Fail readiness; never fail at request time |

### 7. Definition of done

All phase acceptances are met. docs/DECISIONS.md, docs/RUNBOOK.md and the graph diagram are committed. No TODO or FIXME is left in new code. No model IDs are hard-coded. No swallowed exceptions, enforced by a grep check in CI. The shadow-mode report shows the new path matches or beats legacy on every metric.

### 8. Start

Begin with Phase 0. First list the files you will touch, then implement and test.

## Assumptions, verification and sources

Four assumptions shape this plan; confirm them before running Phase 0.

- A Python sidecar (FastAPI plus LangGraph) rather than LangGraph.js inside Node. The Node-only route keeps one language but has weaker chunking, reranking and eval tooling.
- Hosted model inference at first (HF Inference Providers or Endpoints), because a free-tier web instance cannot comfortably run even a 0.6B embedding model.
- The existing Node analyzers stay as the fact source; only retrieval, generation, verification and delivery move.
- PRs, not direct pushes, are the default delivery.

Verify before starting:

- Each recommended model is currently served by the provider you choose.
- LangChain, LangGraph and tree-sitter package APIs against their current docs.
- Findings 1 and 5 against the live providers: call the embedding and chat endpoints once with your real keys.
- The latency targets in Phase 7 are targets, not measurements; tune them on your corpus.

Sources:

- Repo reviewed: github.com/SudeepKagi/PushDoc, cloned October 13, 2026.
- [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations.md): opened; last updated October 9, 2026.
- [Google AI forum thread on gemini-2.5-flash](https://discuss.ai.google.dev/t/gemini-2-5-flash-deprecated-without-warning-earlier-than-shutdown-date/174217): opened.
- [Best embedding models, August 2026](https://theairankings.com/best-embedding-models/): read from a search excerpt only, not opened in full; treat the ranking as approximate.
