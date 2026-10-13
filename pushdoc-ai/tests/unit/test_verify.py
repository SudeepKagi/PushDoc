import asyncio
from pathlib import PurePosixPath

from pushdoc_ai.graph.state import SectionPlan, SectionState
from pushdoc_ai.graph.verification import verify_repair_or_template
from pushdoc_ai.verify.grounding import Claim, SectionDraft
from pushdoc_ai.verify.markdown_ast import markdown_violations


def test_markdown_ast_detects_fences_and_missing_relative_links():
    fence_violations = markdown_violations("## Code\n```py\npass\n", {PurePosixPath("src/main.py")})
    link_violations = markdown_violations("[bad](missing.py)\n", {PurePosixPath("src/main.py")})
    assert any("unbalanced" in violation for violation in fence_violations)
    assert any("unresolved" in violation for violation in link_violations)


def test_hallucinated_claim_is_replaced_by_facts_template():
    section = SectionState(plan=SectionPlan(id="api", title="API", required_facts=["routes"], render_mode="llm", max_tokens=20))
    draft = SectionDraft(markdown="## API\nMade-up route", claims=[Claim(text="It serves fake data", evidence_ids=[], identifiers=["POST /fake"])])
    result = asyncio.run(verify_repair_or_template(section, draft, {"routes": ["GET /health"]}, {"src/main.py:1"}, set()))
    assert result.degraded is True
    assert "GET /health" in result.markdown


def test_repair_can_make_a_draft_safe():
    section = SectionState(plan=SectionPlan(id="overview", title="Overview", render_mode="llm", max_tokens=20))
    draft = SectionDraft(markdown="## Overview\nClaim", claims=[Claim(text="Claim")])

    async def repair(_: SectionDraft, __: list[str]) -> SectionDraft:
        return SectionDraft(markdown="## Overview\nVerified", claims=[Claim(text="Verified", evidence_ids=["e1"])])

    result = asyncio.run(verify_repair_or_template(section, draft, {}, {"e1"}, set(), repair))
    assert result.degraded is False
    assert result.markdown.endswith("Verified")
