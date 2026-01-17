"""
Ralph State Manager
Thread-safe file-based state management for Ralph agents
"""

import json
import os
import threading
from pathlib import Path
from typing import Dict, Any, Optional


class RalphStateManager:
    """Manages Ralph orchestrator and agent state via JSON files"""

    def __init__(self, project_root: Optional[Path] = None):
        if project_root is None:
            # Find project root (where .ralph directory exists)
            current_file = Path(__file__)
            project_root = current_file.parent.parent.parent

        self.project_root = project_root
        self.ralph_dir = project_root / ".ralph"
        self.status_file = self.ralph_dir / "status.json"
        self.lock = threading.RLock()

        # Ensure directories exist
        self.ralph_dir.mkdir(exist_ok=True)
        (self.ralph_dir / "scratchpads").mkdir(exist_ok=True)
        (self.ralph_dir / "checkpoints").mkdir(exist_ok=True)
        (self.ralph_dir / "metrics").mkdir(exist_ok=True)
        (self.ralph_dir / "knowledge").mkdir(exist_ok=True)

        # Initialize status file if it doesn't exist
        if not self.status_file.exists():
            self._initialize_status()

    def _initialize_status(self):
        """Create initial status.json"""
        initial_status = {
            "orchestrator": {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None
            },
            "agents": {}
        }
        self._write_status(initial_status)

    def _read_status(self) -> Dict[str, Any]:
        """Read current status from file"""
        try:
            with open(self.status_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Return default if file corrupted
            return {
                "orchestrator": {"status": "idle", "current_cycle": 0, "current_agent": None},
                "agents": {}
            }

    def _write_status(self, status: Dict[str, Any]):
        """Write status to file atomically"""
        # Write to temporary file first, then rename for atomicity
        temp_file = self.status_file.with_suffix('.tmp')
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(status, f, indent=2, ensure_ascii=False)
        temp_file.replace(self.status_file)

    def get_orchestrator_status(self) -> Dict[str, Any]:
        """Get current orchestrator status"""
        with self.lock:
            status = self._read_status()
            return status.get("orchestrator", {})

    def update_orchestrator_status(self, **updates):
        """Update orchestrator status fields"""
        with self.lock:
            status = self._read_status()
            status.setdefault("orchestrator", {})
            status["orchestrator"].update(updates)
            self._write_status(status)

    def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """Get status for a specific agent"""
        with self.lock:
            status = self._read_status()
            return status.get("agents", {}).get(agent_name, {"status": "unknown"})

    def update_agent_status(self, agent_name: str, **updates):
        """Update status for a specific agent"""
        with self.lock:
            status = self._read_status()
            status.setdefault("agents", {})
            status["agents"].setdefault(agent_name, {})
            status["agents"][agent_name].update(updates)
            self._write_status(status)

    def get_all_agents(self) -> Dict[str, Dict[str, Any]]:
        """Get status for all agents"""
        with self.lock:
            status = self._read_status()
            return status.get("agents", {})

    def reset_agent_statuses(self):
        """Reset all agent statuses to ready"""
        with self.lock:
            status = self._read_status()
            agents = status.get("agents", {})

            for agent_name in agents:
                agents[agent_name] = {
                    "status": "ready",
                    "progress": 0,
                    "message": f"Ready for {agent_name} tasks"
                }

            status["agents"] = agents
            status["orchestrator"] = {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None
            }
            self._write_status(status)

    def get_scratchpad_path(self, agent_name: str) -> Path:
        """Get path to agent's scratchpad file"""
        return self.ralph_dir / "scratchpads" / f"{agent_name}_scratchpad.md"

    def read_scratchpad(self, agent_name: str) -> str:
        """Read agent's scratchpad content"""
        scratchpad_path = self.get_scratchpad_path(agent_name)
        if scratchpad_path.exists():
            return scratchpad_path.read_text(encoding='utf-8')
        return ""

    def write_scratchpad(self, agent_name: str, content: str):
        """Write to agent's scratchpad"""
        scratchpad_path = self.get_scratchpad_path(agent_name)
        scratchpad_path.write_text(content, encoding='utf-8')

    def append_scratchpad(self, agent_name: str, content: str):
        """Append to agent's scratchpad"""
        current = self.read_scratchpad(agent_name)
        if current and not current.endswith('\n'):
            current += '\n'
        self.write_scratchpad(agent_name, current + content)

    def create_checkpoint(self, cycle: int, description: str):
        """Create a git checkpoint"""
        checkpoint_dir = self.ralph_dir / "checkpoints"
        checkpoint_file = checkpoint_dir / f"cycle_{cycle}.txt"

        with open(checkpoint_file, 'w', encoding='utf-8') as f:
            f.write(f"Cycle {cycle}: {description}\n")
            f.write(f"Timestamp: {self._get_timestamp()}\n")

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()


# Global instance
_state_manager = None

def get_state_manager() -> RalphStateManager:
    """Get global state manager instance"""
    global _state_manager
    if _state_manager is None:
        _state_manager = RalphStateManager()
    return _state_manager