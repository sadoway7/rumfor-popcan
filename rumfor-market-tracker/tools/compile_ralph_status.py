"""Compile .ralph/status.json into a JS file for the UI."""

from __future__ import annotations

import json
from pathlib import Path


def ensure_status(project_root: Path) -> dict:
    ralph_dir = project_root / ".ralph"
    status_file = ralph_dir / "status.json"
    ralph_dir.mkdir(parents=True, exist_ok=True)
    if status_file.exists():
        return json.loads(status_file.read_text(encoding="utf-8"))

    default = {
        "orchestrator": {
            "status": "idle",
            "current_cycle": 0,
            "current_agent": None,
            "start_time": None,
            "last_update": None,
        },
        "agents": {
            "user_types": {"status": "idle", "progress": 0, "message": "Ready"},
            "market_types": {"status": "idle", "progress": 0, "message": "Ready"},
            "user_flows": {"status": "idle", "progress": 0, "message": "Ready"},
            "ui_styles": {"status": "idle", "progress": 0, "message": "Ready"},
            "community": {"status": "idle", "progress": 0, "message": "Ready"},
            "applications": {"status": "idle", "progress": 0, "message": "Ready"},
            "backend": {"status": "idle", "progress": 0, "message": "Ready"},
            "api": {"status": "idle", "progress": 0, "message": "Ready"},
            "documentation": {"status": "idle", "progress": 0, "message": "Ready"},
            "research": {"status": "idle", "progress": 0, "message": "Ready"},
            "simple_solution": {"status": "idle", "progress": 0, "message": "Ready"},
            "logic": {"status": "idle", "progress": 0, "message": "Ready"},
        },
    }
    status_file.write_text(json.dumps(default, indent=2), encoding="utf-8")
    return default


def write_js(status: dict, out_path: Path) -> None:
    payload = "const ralphStatus = " + json.dumps(status, indent=2) + ";\n"
    out_path.write_text(payload, encoding="utf-8")


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    status = ensure_status(project_root)
    tools_js = project_root / "tools" / "ralph_status.js"
    root_js = project_root / "ralph_status.js"
    write_js(status, tools_js)
    write_js(status, root_js)
    print(f"Generated: {tools_js}")
    print(f"Also generated: {root_js}")


if __name__ == "__main__":
    main()
