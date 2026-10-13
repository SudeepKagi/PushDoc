from __future__ import annotations

from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from pushdoc_ai.api.job_store import SqliteJobStore
from pushdoc_ai.api.routes import JobStore, router
from pushdoc_ai.graph.builder import ReadmeGraph
from pushdoc_ai.graph.checkpoint import development_checkpointer
from pushdoc_ai.graph.drafting import EvidenceDrafter
from pushdoc_ai.core.config import load_models_config
from pushdoc_ai.models.chat import ChatPool
from pushdoc_ai.models.registry import ModelRegistry
from pushdoc_ai.models.preflight import preflight_models
from pushdoc_ai.core.errors import PushDocAIError


@asynccontextmanager
async def lifespan(app: FastAPI):
    state_path = Path(os.getenv("PUSHDOC_AI_STATE_DB", "data/pushdoc-ai.sqlite3"))
    checkpoint_path = Path(os.getenv("PUSHDOC_AI_CHECKPOINT_DB", "data/checkpoints.sqlite3"))
    database = SqliteJobStore(state_path)
    await database.setup()
    app.state.ready = False
    app.state.preflight_error = None
    drafter = None
    if os.getenv("PUSHDOC_ENABLE_LLM_DRAFTING", "false").lower() == "true":
        registry = ModelRegistry(load_models_config())
        pool = ChatPool(registry)
        try:
            await preflight_models(registry, pool)
        except PushDocAIError as error:
            app.state.preflight_error = str(error)
        else:
            drafter = EvidenceDrafter(pool.invoke)
    async with development_checkpointer(checkpoint_path) as checkpointer:
        await checkpointer.setup()
        graph = (
            ReadmeGraph(drafter=drafter, repairer=drafter.repair, checkpointer=checkpointer)
            if drafter
            else ReadmeGraph(checkpointer=checkpointer)
        )
        app.state.jobs = JobStore(database, graph)
        for payload in await database.incomplete_payloads():
            app.state.jobs.schedule(payload)
        app.state.ready = app.state.preflight_error is None
        yield
        app.state.ready = False


app = FastAPI(title="pushdoc-ai", lifespan=lifespan)
app.include_router(router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz() -> JSONResponse:
    if app.state.ready:
        return JSONResponse({"status": "ready"})
    return JSONResponse({"status": "not_ready", "reason": app.state.preflight_error}, status_code=503)
