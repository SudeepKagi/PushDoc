from __future__ import annotations


def gate_passed(violations: list[str]) -> bool:
    return not any(violation.startswith("BLOCKING:") for violation in violations)
