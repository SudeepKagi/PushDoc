# PushDoc AI runbook

## Rollout and rollback

`AI_BACKEND=legacy` is the default and ships the existing Node path. Set `AI_BACKEND=shadow` to run `pushdoc-ai` alongside it; legacy output remains the only output written or pushed. Inspect the job logs for the shadow gate outcome and latency before enabling `AI_BACKEND=antigravity` for a repository cohort.

`antigravity` rejects any response whose integrity gate fails. Roll back immediately by setting `AI_BACKEND=legacy` and redeploying the worker. Do not use auto-commit until the PR-first delivery implementation is complete.

## Render deployment

`render.yaml` defines a `pushdoc-ai` Docker service with a persistent disk for its SQLite job and
checkpoint databases. Render free services have ephemeral disks, so this service intentionally uses
a paid plan. In the Render dashboard, enter the same existing Gemini and Groq secrets for the
sidecar's `GEMINI_API_KEY_1` and `GROQ_API_KEY_1`, and enter one identical random value for each
service's `AI_SERVICE_TOKEN` (Node) and `PUSHDOC_AI_SERVICE_TOKEN` (sidecar). Keep
`AI_BACKEND=shadow` for the first rollout; use `/readyz` to confirm preflight before enabling
`antigravity` per repository.

## Model change and key rotation

Update only `pushdoc-ai/config/models.yaml` for IDs, endpoints, limits, and fallback order. Supply provider credentials through the named environment variables. Run model preflight in staging before promotion. Rotate a key by adding the replacement secret, validating preflight, then removing the previous secret.

The default sidecar drafter configuration reuses `GEMINI_API_KEY_1` from the existing PushDoc
configuration, with Groq as a fallback. In production, add that existing secret to the `pushdoc-ai`
service's environment as well: separate services do not inherit another service's environment file.

## Index recovery and replay

Per-job LanceDB indexes are disposable. Delete the job-local index and replay the BullMQ job; the content-addressed key includes blob SHA, model ID, dimensions, and chunker version, so incompatible vectors cannot be reused. Redis-backed vector cache rollout must preserve the same key material.

For local development, `PUSHDOC_AI_STATE_DB` and `PUSHDOC_AI_CHECKPOINT_DB` select the durable
SQLite job and LangGraph checkpoint files. Both default beneath `data/`. Do not share these files
between service processes; production deployment needs the planned PostgreSQL persistence adapter.

## Required dashboards and alerts

Publish: job success rate; total and per-node p50/p95; provider fallback rate; degraded-flag rate; cache-hit rate; integrity-gate rejection rate; and cost per job.

Alert on: failed model preflight, fallback rate above 20%, p95 above the Phase 7 target, integrity-gate failures, and a sustained increase in `no_dense` or `no_rerank` flags.

## Incident triage

1. Check `/healthz`, then `/readyz`, and verify the service token matches both processes.
2. Use the job’s SSE events and report to identify the failed node or degraded flag.
3. For provider failures, compare the configured model ID and endpoint against provider availability, then use a configured fallback or roll back.
4. For invalid output, retain the report and facts snapshot; never override a failed gate with a direct push.
