from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from pathlib import PurePosixPath
from time import perf_counter

from langgraph.graph import END, START, StateGraph

from pushdoc_ai.graph.plan import classify_repository, load_section_plan, template_section
from pushdoc_ai.graph.retrieval import retrieve_section_evidence
from pushdoc_ai.graph.state import JobState, SectionState
from pushdoc_ai.graph.verification import verify_repair_or_template
from pushdoc_ai.core.errors import PushDocAIError
from pushdoc_ai.verify.grounding import SectionDraft
from pushdoc_ai.verify.markdown_ast import markdown_violations

DraftSection = Callable[[str, SectionState, dict], Awaitable[str | SectionDraft]]
RepairSection = Callable[[SectionState, SectionDraft, list[str], dict], Awaitable[SectionDraft]]


async def _default_draft(_: str, section: SectionState, facts: dict) -> SectionDraft:
    return SectionDraft(markdown=template_section(section.plan, facts))


class ReadmeGraph:
    def __init__(
        self,
        drafter: DraftSection = _default_draft,
        repairer: RepairSection | None = None,
        concurrency: int = 4,
        checkpointer: object | None = None,
    ):
        self.drafter, self.repairer, self.concurrency = drafter, repairer, concurrency
        graph = StateGraph(dict)
        graph.add_node("classify_repo", self.classify_repo)
        graph.add_node("plan_sections", self.plan_sections)
        graph.add_node("retrieve_sections", self.retrieve_sections)
        graph.add_node("render_sections", self.render_sections)
        graph.add_node("assemble", self.assemble)
        graph.add_edge(START, "classify_repo")
        graph.add_edge("classify_repo", "plan_sections")
        graph.add_edge("plan_sections", "retrieve_sections")
        graph.add_edge("retrieve_sections", "render_sections")
        graph.add_edge("render_sections", "assemble")
        graph.add_edge("assemble", END)
        self.compiled = graph.compile(checkpointer=checkpointer)

    @staticmethod
    def _state(data: dict) -> JobState:
        return JobState.model_validate(data["job"])

    async def classify_repo(self, data: dict) -> dict:
        state = self._state(data)
        started = perf_counter()
        state.event("classify_repo", "started")
        state.repo_type, confidence = classify_repository(state.facts)
        state.event("classify_repo", "finished", confidence=str(confidence))
        state.timings_ms["classify_repo"] = round((perf_counter() - started) * 1000)
        return {"job": state.model_dump(mode="json")}

    async def plan_sections(self, data: dict) -> dict:
        state = self._state(data)
        started = perf_counter()
        state.event("plan_sections", "started")
        state.plan = load_section_plan(state.repo_type or "backend")
        state.sections = {plan.id: SectionState(plan=plan) for plan in state.plan}
        state.event("plan_sections", "finished")
        state.timings_ms["plan_sections"] = round((perf_counter() - started) * 1000)
        return {"job": state.model_dump(mode="json")}

    async def retrieve_sections(self, data: dict) -> dict:
        state = self._state(data)
        started = perf_counter()
        state.event("retrieve_sections", "started")
        if state.facts.get("retrieval_chunks"):
            state.degraded_flags.add("no_dense")
        for section in state.sections.values():
            section.evidence, _ = retrieve_section_evidence(section.plan, state.facts)
        state.facts["evidence_ids"] = [
            item["id"] for section in state.sections.values() for item in section.evidence
        ]
        state.event("retrieve_sections", "finished")
        state.timings_ms["retrieve_sections"] = round((perf_counter() - started) * 1000)
        return {"job": state.model_dump(mode="json")}

    async def render_sections(self, data: dict) -> dict:
        state = self._state(data)
        started = perf_counter()
        if state.deadline_exceeded():
            state.degraded_flags.add("deadline_template_only")
            for section in state.sections.values():
                section.markdown, section.degraded = template_section(section.plan, state.facts), True
            state.timings_ms["render_sections"] = round((perf_counter() - started) * 1000)
            return {"job": state.model_dump(mode="json")}
        semaphore = asyncio.Semaphore(self.concurrency)

        async def render(section: SectionState) -> None:
            async with semaphore:
                state.event(f"section:{section.plan.id}", "started")
                if section.plan.render_mode == "template" or state.deadline_exceeded():
                    section.markdown, section.degraded = template_section(section.plan, state.facts), True
                else:
                    try:
                        drafted = await self.drafter(section.plan.id, section, state.facts)
                        draft = drafted if isinstance(drafted, SectionDraft) else SectionDraft(markdown=drafted)
                        evidence_ids = set(map(str, state.facts.get("evidence_ids", [])))
                        known_paths = {PurePosixPath(path) for path in state.facts.get("paths", [])}
                        repair = None
                        if self.repairer:
                            async def repair(candidate: SectionDraft, violations: list[str]) -> SectionDraft:
                                return await self.repairer(section, candidate, violations, state.facts)
                        await verify_repair_or_template(
                            section, draft, state.facts, evidence_ids, known_paths, repair
                        )
                    except PushDocAIError:
                        section.markdown = template_section(section.plan, state.facts)
                        section.degraded = True
                        state.degraded_flags.add("draft_fallback")
                state.event(f"section:{section.plan.id}", "finished")

        await asyncio.gather(*(render(section) for section in state.sections.values()))
        state.timings_ms["render_sections"] = round((perf_counter() - started) * 1000)
        return {"job": state.model_dump(mode="json")}

    async def assemble(self, data: dict) -> dict:
        state = self._state(data)
        started = perf_counter()
        state.event("assemble", "started")
        project = state.facts.get("project", {})
        title = project.get("name") if isinstance(project, dict) else None
        title = title or state.facts.get("name") or "Project README"
        contents = "\n".join(f"- [{plan.title}](#{plan.title.lower().replace(' ', '-')})" for plan in state.plan)
        sections = [f"# {title}\n\n## Table of Contents\n\n{contents}"]
        for plan in state.plan:
            sections.append(state.sections[plan.id].markdown.rstrip())
        mermaid = state.facts.get("architecture_mermaid", "").strip()
        if mermaid:
            sections.append(f"## Architecture\n\n```mermaid\n{mermaid}\n```")
        markdown = "\n\n".join(sections) + "\n"
        known_paths = {PurePosixPath(path) for path in state.facts.get("paths", [])}
        state.violations = markdown_violations(markdown, known_paths)
        state.event("assemble", "finished")
        state.timings_ms["assemble"] = round((perf_counter() - started) * 1000)
        return {"job": state.model_dump(mode="json"), "readme_markdown": markdown}

    async def run(self, job: JobState) -> dict:
        return await self.compiled.ainvoke(
            {"job": job.model_dump(mode="json")},
            config={"configurable": {"thread_id": job.job_id}},
        )
