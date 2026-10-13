from __future__ import annotations

import asyncio
import json
from collections.abc import Awaitable, Callable

from pushdoc_ai.core.errors import ErrorClass, PushDocAIError
from pushdoc_ai.graph.state import SectionState
from pushdoc_ai.verify.grounding import SectionDraft

Invoke = Callable[[str, str], Awaitable[str]]


class EvidenceDrafter:
    """Converts model JSON into the verified SectionDraft contract."""

    def __init__(self, invoke: Invoke) -> None:
        self.invoke = invoke

    @staticmethod
    def _payload(section: SectionState, facts: dict) -> dict:
        required = {key: facts.get(key) for key in section.plan.required_facts if key in facts}
        return {
            "section": section.plan.model_dump(),
            "facts": required,
            "evidence": section.evidence,
        }

    @staticmethod
    def _parse(response: str) -> SectionDraft:
        body = response.strip()
        if body.startswith("```json") and body.endswith("```"):
            body = body.removeprefix("```json").removesuffix("```").strip()
        try:
            return SectionDraft.model_validate_json(body)
        except ValueError as error:
            raise PushDocAIError("Drafter returned invalid structured output", ErrorClass.FALLBACK) from error

    async def __call__(self, _: str, section: SectionState, facts: dict) -> SectionDraft:
        prompt = (
            "Write exactly one README section using only the supplied facts and evidence. "
            "Return JSON matching {markdown: string, claims: [{text, evidence_ids, identifiers}]}. "
            "Every behavioural claim must cite one or more evidence IDs. Do not add an H1 title.\n\n"
            + json.dumps(self._payload(section, facts), default=str)
        )
        try:
            async with asyncio.timeout(45):
                return self._parse(await self.invoke("drafter", prompt))
        except TimeoutError as error:
            raise PushDocAIError("Section drafting timed out", ErrorClass.FALLBACK) from error

    async def repair(self, section: SectionState, draft: SectionDraft, violations: list[str], facts: dict) -> SectionDraft:
        prompt = (
            "Repair this README section. Return only the structured SectionDraft JSON. "
            "Remove any unsupported claims; every remaining behavioural claim needs valid evidence_ids.\n\n"
            + json.dumps(
                {"draft": draft.model_dump(), "violations": violations, **self._payload(section, facts)},
                default=str,
            )
        )
        try:
            async with asyncio.timeout(45):
                return self._parse(await self.invoke("drafter", prompt))
        except TimeoutError as error:
            raise PushDocAIError("Section repair timed out", ErrorClass.FALLBACK) from error
