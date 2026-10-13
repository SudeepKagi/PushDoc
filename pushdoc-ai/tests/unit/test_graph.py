import asyncio
from datetime import datetime, timedelta, timezone

from pushdoc_ai.graph.builder import ReadmeGraph
from pushdoc_ai.graph.drafting import EvidenceDrafter
from pushdoc_ai.graph.state import JobState


def test_graph_classifies_plans_and_assembles_sections():
    job = JobState(job_id="job-1", facts={"project": {"name": "Demo"}, "routes": ["GET /health"], "scripts": ["npm test"], "architecture_mermaid": "flowchart TD\n  A --> B"})
    result = asyncio.run(ReadmeGraph().run(job))
    assert result["readme_markdown"].startswith("# Demo\n\n## Table of Contents")
    assert "## Overview" in result["readme_markdown"]
    assert "## Installation" in result["readme_markdown"]
    assert "```mermaid\nflowchart TD\n  A --> B\n```" in result["readme_markdown"]
    assert result["job"]["repo_type"] == "backend"
    assert result["job"]["timings_ms"].keys() >= {"classify_repo", "plan_sections", "retrieve_sections", "render_sections", "assemble"}


def test_deadline_uses_template_only_fallback():
    job = JobState(
        job_id="expired", facts={"routes": ["GET /health"]},
        deadline=datetime.now(timezone.utc) - timedelta(seconds=1),
    )
    result = asyncio.run(ReadmeGraph().run(job))
    assert "deadline_template_only" in result["job"]["degraded_flags"]


def test_graph_packs_bm25_evidence_per_section():
    job = JobState(
        job_id="evidence",
        facts={
            "routes": ["GET /orders"],
            "retrieval_chunks": [
                {
                    "id": "routes.py:0-20",
                    "path": "src/routes.py",
                    "language": "python",
                    "symbol": "orders",
                    "content": "GET /orders returns customer orders",
                    "source_start": 0,
                    "source_end": 39,
                }
            ],
        },
    )
    result = asyncio.run(ReadmeGraph().run(job))
    assert result["job"]["sections"]["api"]["evidence"][0]["id"] == "routes.py:0-20"


def test_model_draft_requires_evidence_citations():
    async def invoke(_: str, __: str) -> str:
        return '{"markdown":"## API Overview\\n\\nOrders are available.","claims":[{"text":"Orders are available.","evidence_ids":["routes.py:0-20"],"identifiers":["GET /orders"]}]}'

    drafter = EvidenceDrafter(invoke)
    job = JobState(
        job_id="draft",
        facts={
            "routes": ["GET /orders"],
            "retrieval_chunks": [
                {
                    "id": "routes.py:0-20",
                    "path": "src/routes.py",
                    "language": "python",
                    "symbol": "orders",
                    "content": "GET /orders returns customer orders",
                    "source_start": 0,
                    "source_end": 39,
                }
            ],
        },
    )
    result = asyncio.run(ReadmeGraph(drafter=drafter, repairer=drafter.repair).run(job))
    assert "Orders are available." in result["readme_markdown"]
    assert not result["job"]["sections"]["api"]["degraded"]
