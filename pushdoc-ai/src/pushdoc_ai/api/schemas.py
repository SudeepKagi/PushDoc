from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class RepoRef(BaseModel):
    full_name: str
    default_branch: str
    commit_sha: str


class ReadmeJobRequest(BaseModel):
    job_id: str = Field(min_length=1, max_length=255)
    repo: RepoRef
    facts: dict = Field(default_factory=dict)
    architecture_mermaid: str = ""
    existing_readme: str | None = None
    # A 25 MiB gzip snapshot expands to at most ~34.96 MiB when base64 encoded.
    snapshot_base64: str | None = Field(default=None, max_length=35_000_000)


class JobReport(BaseModel):
    gate_passed: bool = False
    violations: list[str] = Field(default_factory=list)
    per_section: dict = Field(default_factory=dict)
    degraded_flags: list[str] = Field(default_factory=list)
    truncated_files: list[str] = Field(default_factory=list)
    unknown_files: list[str] = Field(default_factory=list)
    latency_ms_per_node: dict[str, int] = Field(default_factory=dict)
    model_ids_used: list[str] = Field(default_factory=list)
    cache_hit_rate: float = Field(default=0, ge=0, le=1)


class JobResponse(BaseModel):
    job_id: str
    status: Literal["PENDING", "RUNNING", "COMPLETED", "FAILED"]
    readme_markdown: str | None = None
    report: JobReport | None = None
