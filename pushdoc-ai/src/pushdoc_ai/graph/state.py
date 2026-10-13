from __future__ import annotations

from datetime import datetime, timedelta, timezone

from pydantic import BaseModel, Field


class SectionPlan(BaseModel):
    id: str
    title: str
    required_facts: list[str] = Field(default_factory=list)
    render_mode: str
    max_tokens: int


class SectionState(BaseModel):
    plan: SectionPlan
    markdown: str = ""
    violations: list[str] = Field(default_factory=list)
    attempts: int = 0
    degraded: bool = False
    evidence: list[dict] = Field(default_factory=list)


class JobState(BaseModel):
    job_id: str
    facts: dict = Field(default_factory=dict)
    repo_type: str | None = None
    plan: list[SectionPlan] = Field(default_factory=list)
    sections: dict[str, SectionState] = Field(default_factory=dict)
    events: list[dict] = Field(default_factory=list)
    degraded_flags: set[str] = Field(default_factory=set)
    violations: list[str] = Field(default_factory=list)
    timings_ms: dict[str, int] = Field(default_factory=dict)
    deadline: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(seconds=120))

    def deadline_exceeded(self) -> bool:
        return datetime.now(timezone.utc) >= self.deadline

    def event(self, node: str, status: str, **extra: str) -> None:
        self.events.append({"node": node, "status": status, "at": datetime.now(timezone.utc).isoformat(), **extra})
