"""Generate .roomodes content for Ralph agents.

This helper is optional; keep .roomodes in sync manually if preferred.
"""

from __future__ import annotations

import yaml
from pathlib import Path


def generate_modes() -> dict:
    return {
        "customModes": [
            {
                "slug": "ralph-orchestrator",
                "name": "Ralph Orchestrator",
                "roleDefinition": "Orchestrates all Ralph agents for Rumfor Market Tracker.",
                "whenToUse": "Run full agent cycles",
                "description": "Orchestrator mode",
                "groups": ["read", "edit", "command"],
            },
        ]
    }


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]
    output = project_root / ".roomodes"
    output.write_text(yaml.safe_dump(generate_modes(), sort_keys=False), encoding="utf-8")
    print(f"Generated {output}")


if __name__ == "__main__":
    main()
