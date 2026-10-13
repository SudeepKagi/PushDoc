from __future__ import annotations

from pydantic import BaseModel, Field


class Claim(BaseModel):
    text: str
    evidence_ids: list[str] = Field(default_factory=list)
    identifiers: list[str] = Field(default_factory=list)


class SectionDraft(BaseModel):
    markdown: str
    claims: list[Claim] = Field(default_factory=list)


def grounding_violations(draft: SectionDraft, valid_evidence: set[str], valid_identifiers: set[str]) -> list[str]:
    violations: list[str] = []
    for claim in draft.claims:
        if not claim.evidence_ids:
            violations.append(f"BLOCKING: uncited claim: {claim.text}")
        if unknown_evidence := set(claim.evidence_ids) - valid_evidence:
            violations.append(f"BLOCKING: unknown evidence: {', '.join(sorted(unknown_evidence))}")
        if unknown_identifiers := set(claim.identifiers) - valid_identifiers:
            violations.append(f"BLOCKING: invented identifier: {', '.join(sorted(unknown_identifiers))}")
    return violations
