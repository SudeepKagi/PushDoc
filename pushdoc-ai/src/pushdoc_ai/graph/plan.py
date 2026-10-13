from __future__ import annotations

from pathlib import Path

import yaml

from pushdoc_ai.graph.state import SectionPlan


def classify_repository(facts: dict) -> tuple[str, float]:
    if facts.get("routes"):
        return "backend", 0.95
    if any("react" in str(item).lower() for item in facts.get("dependencies", [])):
        return "frontend", 0.9
    return "backend", 0.5


def load_section_plan(repo_type: str, config_dir: Path | None = None) -> list[SectionPlan]:
    directory = config_dir or Path(__file__).parents[3] / "config" / "sections"
    with (directory / f"{repo_type}.yaml").open("rb") as handle:
        return [SectionPlan.model_validate(item) for item in yaml.safe_load(handle)["sections"]]


def template_section(plan: SectionPlan, facts: dict) -> str:
    values = facts.get(plan.required_facts[0], []) if plan.required_facts else []
    if isinstance(values, dict):
        values = [f"{key}: {value}" for key, value in values.items()]
    lines = "\n".join(f"- `{value}`" for value in values) or "- No verified facts available."
    return f"## {plan.title}\n\n{lines}\n"
