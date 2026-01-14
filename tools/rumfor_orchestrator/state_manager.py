"""
Rumfor Infinity Rule List - State Manager

Thread-safe file-based state management for the Rumfor orchestrator.
"""

import json
import threading
import time
from pathlib import Path
from typing import Dict, Any, Optional


class RumforStateManager:
    """Manages Rumfor Orchestrator state through file-based storage."""

    # Agent definitions for Rumfor Market Tracker
    AGENTS = [
        "frontend",
        "backend",
        "api",
        "styling",
        "testing",
        "security",
        "documentation",
        "deployment"
    ]

    def __init__(self, rumfor_dir: Optional[Path] = None):
        """Initialize the state manager."""
        if rumfor_dir is None:
            # Default to .rumfor in project root
            rumfor_dir = Path(__file__).parent.parent / ".rumfor"

        self.rumfor_dir = rumfor_dir
        self.rumfor_dir.mkdir(parents=True, exist_ok=True)

        self.status_file = self.rumfor_dir / "status.json"
        self.lock = threading.Lock()

        # Initialize status if it doesn't exist
        if not self.status_file.exists():
            self._initialize_status()

    def _initialize_status(self) -> None:
        """Create initial status file."""
        initial_status = {
            "orchestrator": {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None,
                "start_time": None,
                "last_update": time.time()
            },
            "agents": {}
        }

        # Initialize all agents
        for agent_slug in self.AGENTS:
            initial_status["agents"][agent_slug] = {
                "status": "idle",
                "progress": 0,
                "message": "Ready",
                "last_run": None,
                "last_result": None
            }

        with self.lock:
            self._write_status_no_lock(initial_status)

    def get_status(self) -> Dict[str, Any]:
        """Get current status (thread-safe)."""
        with self.lock:
            return self._read_status_no_lock()

    def update_agent_status(self, agent_name: str, **kwargs) -> None:
        """Update an agent's status (thread-safe)."""
        with self.lock:
            status = self._read_status_no_lock()

            if agent_name not in status["agents"]:
                status["agents"][agent_name] = {
                    "status": "idle",
                    "progress": 0,
                    "message": "Ready",
                    "last_run": None,
                    "last_result": None
                }

            agent_status = status["agents"][agent_name]

            # Update provided fields
            for key, value in kwargs.items():
                agent_status[key] = value

            # Update timestamp for orchestrator
            status["orchestrator"]["last_update"] = time.time()

            self._write_status_no_lock(status)

    def mark_cycle_start(self, cycle_number: int) -> None:
        """Mark the start of a new cycle."""
        with self.lock:
            status = self._read_status_no_lock()

            status["orchestrator"]["status"] = "running"
            status["orchestrator"]["current_cycle"] = cycle_number
            status["orchestrator"]["current_agent"] = None
            status["orchestrator"]["start_time"] = time.time()
            status["orchestrator"]["last_update"] = time.time()

            self._write_status_no_lock(status)

    def mark_cycle_complete(self, cycle_number: int) -> None:
        """Mark a cycle as completed."""
        with self.lock:
            status = self._read_status_no_lock()

            status["orchestrator"]["status"] = "idle"
            status["orchestrator"]["current_cycle"] = cycle_number
            status["orchestrator"]["current_agent"] = None
            status["orchestrator"]["start_time"] = None
            status["orchestrator"]["last_update"] = time.time()

            self._write_status_no_lock(status)

    def set_current_agent(self, agent_name: Optional[str]) -> None:
        """Set which agent is currently running."""
        with self.lock:
            status = self._read_status_no_lock()
            status["orchestrator"]["current_agent"] = agent_name
            status["orchestrator"]["last_update"] = time.time()
            self._write_status_no_lock(status)

    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of current status."""
        status = self.get_status()

        agents_running = sum(1 for agent in status["agents"].values() if agent["status"] == "running")
        agents_complete = sum(1 for agent in status["agents"].values() if agent["status"] == "complete")
        agents_error = sum(1 for agent in status["agents"].values() if agent["status"] == "error")

        return {
            "orchestrator_status": status["orchestrator"]["status"],
            "current_cycle": status["orchestrator"]["current_cycle"],
            "current_agent": status["orchestrator"]["current_agent"],
            "agents_running": agents_running,
            "agents_complete": agents_complete,
            "agents_error": agents_error,
            "total_agents": len(self.AGENTS),
            "last_update": status["orchestrator"]["last_update"]
        }

    def reset_all_agents(self) -> None:
        """Reset all agents to idle status (for testing/debugging)."""
        with self.lock:
            status = self._read_status_no_lock()

            for agent_slug in self.AGENTS:
                status["agents"][agent_slug] = {
                    "status": "idle",
                    "progress": 0,
                    "message": "Ready",
                    "last_run": None,
                    "last_result": None
                }

            status["orchestrator"]["status"] = "idle"
            status["orchestrator"]["current_agent"] = None
            status["orchestrator"]["last_update"] = time.time()

            self._write_status_no_lock(status)

    def _read_status_no_lock(self) -> Dict[str, Any]:
        """Read status file without locking (internal use)."""
        if not self.status_file.exists():
            self._initialize_status()
            return self._read_status_no_lock()

        try:
            with open(self.status_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            # If file is corrupted, reinitialize
            print(f"Warning: Status file corrupted, reinitializing: {self.status_file}")
            self._initialize_status()
            return self._read_status_no_lock()

    def _write_status_no_lock(self, status: Dict[str, Any]) -> None:
        """Write status file without locking (internal use)."""
        try:
            with open(self.status_file, 'w') as f:
                json.dump(status, f, indent=2, default=str)
        except IOError as e:
            print(f"Error writing status file: {e}")
            raise

    def create_checkpoint(self, agent_name: str, message: str) -> bool:
        """Create a git checkpoint for agent progress."""
        try:
            import subprocess

            # Create git commit with agent info
            commit_msg = f"[{agent_name}] {message}"

            # Stage changes
            subprocess.run(["git", "add", "."], check=True, capture_output=True)

            # Check if there are changes to commit
            result = subprocess.run(["git", "diff", "--cached", "--quiet"], capture_output=True)
            if result.returncode == 1:  # There are changes
                subprocess.run(["git", "commit", "-m", commit_msg], check=True, capture_output=True)
                return True
            else:
                return False  # No changes to commit

        except (subprocess.CalledProcessError, FileNotFoundError):
            # Git not available or other error
            return False