"""Thread-safe file-based state management for Ralph."""

from __future__ import annotations

import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional


DEFAULT_AGENTS = [
    "user_types",
    "market_types",
    "user_flows",
    "ui_styles",
    "community",
    "applications",
    "backend",
    "api",
    "documentation",
    "research",
    "simple_solution",
    "logic",
]


class RalphStateManager:
    """Manages Ralph Orchestrator state through file-based storage."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.ralph_dir = project_root / ".ralph"
        self.status_file = self.ralph_dir / "status.json"
        self.lock = threading.Lock()
        self._ensure_defaults()

    def _ensure_defaults(self) -> None:
        self.ralph_dir.mkdir(parents=True, exist_ok=True)
        if not self.status_file.exists():
            self._write_status(self._default_status())

    def _default_status(self) -> Dict[str, Any]:
        return {
            "orchestrator": {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None,
                "start_time": None,
                "last_update": None,
            },
            "agents": {
                agent: {
                    "status": "idle",
                    "last_run": None,
                    "last_result": "",
                    "progress": 0,
                    "message": "Ready",
                }
                for agent in DEFAULT_AGENTS
            },
        }

    def _read_status(self) -> Dict[str, Any]:
        if not self.status_file.exists():
            return self._default_status()
        return json.loads(self.status_file.read_text(encoding="utf-8"))

    def _write_status(self, status: Dict[str, Any]) -> None:
        self.status_file.write_text(json.dumps(status, indent=2), encoding="utf-8")

    def update_agent_status(self, agent_name: str, **kwargs: Any) -> None:
        with self.lock:
            state = self._read_status()
            if agent_name not in state["agents"]:
                state["agents"][agent_name] = {
                    "status": "idle",
                    "last_run": None,
                    "last_result": "",
                    "progress": 0,
                    "message": "Ready",
                }
            agent_state = state["agents"][agent_name]
            for key, value in kwargs.items():
                agent_state[key] = value
            state["orchestrator"]["last_update"] = datetime.utcnow().isoformat()
            self._write_status(state)

    def mark_agent_start(self, agent_name: str) -> None:
        self.update_agent_status(
            agent_name,
            status="running",
            progress=0,
            message=f"Running {agent_name} agent...",
        )

    def mark_agent_complete(self, agent_name: str, result: str) -> None:
        self.update_agent_status(
            agent_name,
            status="complete",
            progress=100,
            last_run=datetime.utcnow().isoformat(),
            last_result=result,
            message=result,
        )

    def mark_agent_error(self, agent_name: str, error: str) -> None:
        self.update_agent_status(
            agent_name,
            status="error",
            last_run=datetime.utcnow().isoformat(),
            last_result=error,
            message=error,
        )

    def update_orchestrator(self, **kwargs: Any) -> None:
        with self.lock:
            state = self._read_status()
            for key, value in kwargs.items():
                state["orchestrator"][key] = value
            state["orchestrator"]["last_update"] = datetime.utcnow().isoformat()
            self._write_status(state)


_STATE_MANAGER: Optional[RalphStateManager] = None


def get_state_manager(project_root: Optional[Path] = None) -> RalphStateManager:
    global _STATE_MANAGER
    if _STATE_MANAGER is None:
        if project_root is None:
            project_root = Path(__file__).resolve().parents[2]
        _STATE_MANAGER = RalphStateManager(project_root)
    return _STATE_MANAGER
