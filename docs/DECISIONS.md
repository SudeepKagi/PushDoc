# Architecture decisions

## 2026-10-13: Phase 1 model boundary

PushDoc retains Node as its GitHub, queue, and static-analysis control plane. The new `pushdoc-ai` Python service owns model selection, resilience wrappers, embeddings, and reranking. All model IDs, limits, endpoints, and credential environment-variable names are in `pushdoc-ai/config/models.yaml`; production deployment must verify each configured provider endpoint with preflight before becoming ready.

The service uses async HTTP clients for hosted TEI/Hugging Face-compatible embedding and reranking endpoints, plus LangChain's OpenAI-compatible `ChatOpenAI` integration for chat providers. Dependencies are version-pinned in `pushdoc-ai/pyproject.toml`.

LangGraph checkpointing is deferred to Phase 4. Current LangGraph documentation identifies `AsyncSqliteSaver` for async SQLite development and `AsyncPostgresSaver` for production; Phase 4 will add the appropriate backend when the graph is introduced.

## 2026-10-13: Rollout safety

The new backend has three modes: `legacy`, `shadow`, and `antigravity`. Shadow mode runs the new service and records its report but preserves legacy delivery. Antigravity mode requires a passing integrity gate. PR-first delivery remains an open Phase 6 integration task; direct default-branch writes are not enabled by this rollout.
