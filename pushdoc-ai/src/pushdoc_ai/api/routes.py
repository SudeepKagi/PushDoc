from __future__ import annotations

import asyncio
import base64
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from pushdoc_ai.api.auth import require_service_token
from pushdoc_ai.api.job_store import SqliteJobStore
from pushdoc_ai.api.schemas import JobReport, JobResponse, ReadmeJobRequest
from pushdoc_ai.graph.builder import ReadmeGraph
from pushdoc_ai.graph.state import JobState
from pushdoc_ai.ingest.chunking import chunk_snapshot
from pushdoc_ai.ingest.snapshot import parse_snapshot
from pushdoc_ai.verify.scoring import gate_passed

router = APIRouter(prefix="/v1")


class JobStore:
    def __init__(self, database: SqliteJobStore, graph: ReadmeGraph) -> None:
        self.database, self.graph = database, graph

    async def submit(self, payload: ReadmeJobRequest) -> JobResponse:
        response, created = await self.database.create(payload)
        if created or response.status in {"PENDING", "RUNNING"}:
            self.schedule(payload)
        return response

    def schedule(self, payload: ReadmeJobRequest) -> None:
        if payload.job_id not in self.database.running:
            self.database.running.add(payload.job_id)
            asyncio.create_task(self.run(payload))

    async def run(self, payload: ReadmeJobRequest) -> None:
        async with self.database.semaphore:
            response: JobResponse | None = None
            try:
                response = await self.database.get(payload.job_id)
                if response is None:
                    return
                response.status = "RUNNING"
                await self.database.save(response)
                started = time.perf_counter()
                facts = payload.facts.copy()
                facts["architecture_mermaid"] = payload.architecture_mermaid
                if payload.snapshot_base64:
                    snapshot = parse_snapshot(base64.b64decode(payload.snapshot_base64, validate=True))
                    facts["paths"] = [str(file.path) for file in snapshot.files]
                    facts["unknown_files"] = snapshot.unknown_paths
                    facts["truncated_files"] = snapshot.skipped_paths
                    facts["retrieval_chunks"] = [
                        {
                            "id": chunk.id,
                            "path": str(chunk.path),
                            "language": chunk.language,
                            "symbol": chunk.symbol,
                            "content": chunk.content,
                            "source_start": chunk.source_start,
                            "source_end": chunk.source_end,
                        }
                        for chunk in chunk_snapshot(snapshot.files)
                    ]
                result = await self.graph.run(JobState(job_id=payload.job_id, facts=facts))
                job, sections = result["job"], result["job"]["sections"]
                violations = job["violations"] + [
                    item for section in sections.values() for item in section["violations"]
                ]
                response.readme_markdown = result["readme_markdown"]
                response.report = JobReport(
                    gate_passed=gate_passed(violations),
                    violations=violations,
                    per_section=sections,
                    degraded_flags=job["degraded_flags"],
                    truncated_files=facts.get("truncated_files", []),
                    unknown_files=facts.get("unknown_files", []),
                    latency_ms_per_node={
                        **job["timings_ms"], "total": round((time.perf_counter() - started) * 1000)
                    },
                    model_ids_used=job.get("model_ids_used", []),
                    cache_hit_rate=1 if "query_cache_hit" in job["degraded_flags"] else 0,
                )
                response.status = "COMPLETED"
                await self.database.save(response, job["events"])
            except Exception as error:
                if response is not None:
                    response.status = "FAILED"
                    response.report = JobReport(violations=[f"service failure: {error}"])
                    await self.database.save(response)
            finally:
                self.database.running.discard(payload.job_id)


def store(request: Request) -> JobStore:
    return request.app.state.jobs


@router.post("/readme-jobs", status_code=202, response_model=JobResponse, dependencies=[Depends(require_service_token)])
async def create_job(payload: ReadmeJobRequest, request: Request) -> JobResponse:
    return await store(request).submit(payload)


@router.get("/readme-jobs/{job_id}", response_model=JobResponse, dependencies=[Depends(require_service_token)])
async def get_job(job_id: str, request: Request) -> JobResponse:
    response = await store(request).database.get(job_id)
    if response is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return response


@router.get("/readme-jobs/{job_id}/events", dependencies=[Depends(require_service_token)])
async def events(job_id: str, request: Request) -> StreamingResponse:
    jobs = store(request)
    if await jobs.database.get(job_id) is None:
        raise HTTPException(status_code=404, detail="Job not found")

    async def stream():
        sent = 0
        while True:
            current_events = await jobs.database.events(job_id) or []
            for event in current_events[sent:]:
                yield f"event: {event['status']}\ndata: {event}\n\n"
            sent = len(current_events)
            response = await jobs.database.get(job_id)
            if response and response.status in {"COMPLETED", "FAILED"}:
                yield f"event: complete\ndata: {response.status}\n\n"
                return
            await asyncio.sleep(0.25)

    return StreamingResponse(stream(), media_type="text/event-stream")
