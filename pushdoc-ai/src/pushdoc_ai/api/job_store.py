from __future__ import annotations

import asyncio
import json
import sqlite3
from pathlib import Path

from pushdoc_ai.api.schemas import JobResponse, ReadmeJobRequest


class SqliteJobStore:
    """Durable job metadata for development and single-instance deployments."""

    def __init__(self, database_path: Path, concurrency: int = 4) -> None:
        self.database_path = database_path
        self.semaphore = asyncio.Semaphore(concurrency)
        self.running: set[str] = set()

    async def setup(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        await asyncio.to_thread(self._setup)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _setup(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS readme_jobs (
                    job_id TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL,
                    response_json TEXT NOT NULL,
                    events_json TEXT NOT NULL DEFAULT '[]'
                )
                """
            )

    async def create(self, payload: ReadmeJobRequest) -> tuple[JobResponse, bool]:
        return await asyncio.to_thread(self._create, payload)

    def _create(self, payload: ReadmeJobRequest) -> tuple[JobResponse, bool]:
        response = JobResponse(job_id=payload.job_id, status="PENDING")
        with self._connect() as connection:
            cursor = connection.execute(
                "INSERT OR IGNORE INTO readme_jobs(job_id, payload_json, response_json) VALUES (?, ?, ?)",
                (payload.job_id, payload.model_dump_json(), response.model_dump_json()),
            )
            if cursor.rowcount:
                return response, True
            row = connection.execute(
                "SELECT response_json FROM readme_jobs WHERE job_id = ?", (payload.job_id,)
            ).fetchone()
        return JobResponse.model_validate_json(row["response_json"]), False

    async def get(self, job_id: str) -> JobResponse | None:
        return await asyncio.to_thread(self._get, job_id)

    def _get(self, job_id: str) -> JobResponse | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT response_json FROM readme_jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
        return JobResponse.model_validate_json(row["response_json"]) if row else None

    async def payload(self, job_id: str) -> ReadmeJobRequest | None:
        return await asyncio.to_thread(self._payload, job_id)

    def _payload(self, job_id: str) -> ReadmeJobRequest | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT payload_json FROM readme_jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
        return ReadmeJobRequest.model_validate_json(row["payload_json"]) if row else None

    async def save(self, response: JobResponse, events: list[dict] | None = None) -> None:
        await asyncio.to_thread(self._save, response, events)

    def _save(self, response: JobResponse, events: list[dict] | None) -> None:
        with self._connect() as connection:
            if events is None:
                connection.execute(
                    "UPDATE readme_jobs SET response_json = ? WHERE job_id = ?",
                    (response.model_dump_json(), response.job_id),
                )
            else:
                connection.execute(
                    "UPDATE readme_jobs SET response_json = ?, events_json = ? WHERE job_id = ?",
                    (response.model_dump_json(), json.dumps(events), response.job_id),
                )

    async def events(self, job_id: str) -> list[dict] | None:
        return await asyncio.to_thread(self._events, job_id)

    def _events(self, job_id: str) -> list[dict] | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT events_json FROM readme_jobs WHERE job_id = ?", (job_id,)
            ).fetchone()
        return json.loads(row["events_json"]) if row else None

    async def incomplete_payloads(self) -> list[ReadmeJobRequest]:
        return await asyncio.to_thread(self._incomplete_payloads)

    def _incomplete_payloads(self) -> list[ReadmeJobRequest]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload_json FROM readme_jobs WHERE json_extract(response_json, '$.status') IN ('PENDING', 'RUNNING')"
            ).fetchall()
        return [ReadmeJobRequest.model_validate_json(row["payload_json"]) for row in rows]
