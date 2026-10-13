from __future__ import annotations

from collections.abc import Awaitable, Callable
from pathlib import PurePosixPath

from pushdoc_ai.graph.plan import template_section
from pushdoc_ai.graph.state import SectionState
from pushdoc_ai.verify.grounding import SectionDraft, grounding_violations
from pushdoc_ai.verify.markdown_ast import markdown_violations
from pushdoc_ai.verify.scoring import gate_passed

Repair = Callable[[SectionDraft, list[str]], Awaitable[SectionDraft]]


async def verify_repair_or_template(
    section: SectionState,
    draft: SectionDraft,
    facts: dict,
    evidence_ids: set[str],
    known_paths: set[PurePosixPath],
    repair: Repair | None = None,
) -> SectionState:
    identifiers = {str(item) for values in facts.values() if isinstance(values, list) for item in values}

    def violations(candidate: SectionDraft) -> list[str]:
        return markdown_violations(candidate.markdown, known_paths) + grounding_violations(candidate, evidence_ids, identifiers)

    current = draft
    for attempt in range(3):
        section.attempts = attempt
        found = violations(current)
        if gate_passed(found):
            section.markdown, section.violations = current.markdown, []
            return section
        if repair is None or attempt == 2:
            break
        current = await repair(current, found)
    section.markdown = template_section(section.plan, facts)
    section.violations = found
    section.degraded = True
    return section
