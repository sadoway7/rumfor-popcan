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
    """Manages Rumfor Orchestrator state through file-based storage (Ralph-style)."""

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
        """Initialize the state manager with Ralph-style thread safety."""
        if rumfor_dir is None:
            # Default to .rumfor in project root
            rumfor_dir = Path(__file__).parent.parent / ".rumfor"

        self.rumfor_dir = rumfor_dir
        self.rumfor_dir.mkdir(parents=True, exist_ok=True)

        self.status_file = self.rumfor_dir / "status.json"
        self.lock = threading.RLock()  # Reentrant lock for complex operations

        # Initialize status if it doesn't exist
        if not self.status_file.exists():
            self._initialize_status()

    def _initialize_status(self) -> None:
        """Create initial status file with Ralph-style comprehensive state."""
        initial_status = {
            "orchestrator": {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None,
                "start_time": None,
                "last_update": time.time(),
                "total_cycles_run": 0,
                "system_health": "healthy",
                "auto_mode": False  # Can be enabled for continuous operation
            },
            "agents": {},
            "metadata": {
                "version": "2.0",  # Ralph-style versioning
                "created_at": time.time(),
                "last_modified": time.time()
            }
        }

        # Initialize all agents with comprehensive status
        for agent_slug in self.AGENTS:
            initial_status["agents"][agent_slug] = self._create_default_agent_status()

        with self.lock:
            self._write_status_no_lock(initial_status)

    def _create_default_agent_status(self) -> Dict[str, Any]:
        """Create default agent status with Ralph-style richness."""
        current_time = time.time()
        return {
            "status": "idle",
            "progress": 0,
            "message": "Ready",
            "last_run": None,
            "last_result": None,
            "last_success": None,
            "last_error": None,
            "last_status_change": current_time,
            "total_runs": 0,
            "success_count": 0,
            "error_count": 0,
            "progress_history": [],
            "performance_metrics": {
                "avg_execution_time": 0,
                "success_rate": 100.0,
                "files_modified_avg": 0
            }
        }

    def get_status(self) -> Dict[str, Any]:
        """Get current status (thread-safe)."""
        with self.lock:
            return self._read_status_no_lock()

    def update_agent_status(self, agent_name: str, **kwargs) -> None:
        """Update an agent's status (thread-safe, Ralph-style)."""
        with self.lock:
            status = self._read_status_no_lock()

            if agent_name not in status["agents"]:
                status["agents"][agent_name] = self._create_default_agent_status()

            agent_status = status["agents"][agent_name]

            # Ralph-style enhancements: track timestamps and richer metadata
            current_time = time.time()

            # Update provided fields
            for key, value in kwargs.items():
                agent_status[key] = value

            # Auto-update timestamps
            if 'status' in kwargs and kwargs['status'] in ['running', 'complete', 'error']:
                agent_status['last_status_change'] = current_time
                if kwargs['status'] == 'complete':
                    agent_status['last_success'] = current_time
                elif kwargs['status'] == 'error':
                    agent_status['last_error'] = current_time

            # Auto-track progress history
            if 'progress' in kwargs:
                if 'progress_history' not in agent_status:
                    agent_status['progress_history'] = []
                # Keep last 10 progress updates for analysis
                agent_status['progress_history'].append({
                    'progress': kwargs['progress'],
                    'timestamp': current_time,
                    'message': kwargs.get('message', '')
                })
                agent_status['progress_history'] = agent_status['progress_history'][-10:]

            # Update global orchestrator timestamp
            status["orchestrator"]["last_update"] = current_time

            self._write_status_no_lock(status)

    def update_orchestrator_status(self, **kwargs) -> None:
        """Update orchestrator status (Ralph-style orchestrator methods)."""
        with self.lock:
            status = self._read_status_no_lock()
            orchestrator = status["orchestrator"]

            for key, value in kwargs.items():
                orchestrator[key] = value

            # Auto-update timestamp
            if 'last_update' not in kwargs:
                orchestrator["last_update"] = time.time()

            self._write_status_no_lock(status)

    def get_orchestrator_status(self) -> Dict[str, Any]:
        """Get orchestrator status (for orchestrator loop)."""
        status = self.get_status()
        return status["orchestrator"]

    def mark_agent_start(self, agent_name: str) -> None:
        """Mark agent as started (Ralph-style)."""
        self.update_agent_status(
            agent_name,
            status="running",
            progress=0,
            message=f"Running {agent_name} agent...",
            start_time=time.time()
        )

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