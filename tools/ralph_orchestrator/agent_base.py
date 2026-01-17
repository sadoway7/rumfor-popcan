"""
Ralph Agent Base Class
Base functionality for all Ralph specialist agents
"""

import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

from .state_manager import get_state_manager, RalphStateManager


class AgentResult:
    """Result of an agent operation"""

    def __init__(self, success: bool = True, message: str = "", data: Dict[str, Any] = None):
        self.success = success
        self.message = message
        self.data = data or {}


class RalphAgent(ABC):
    """Base class for all Ralph agents"""

    # Default timeouts and retry settings
    TIMEOUT_SECONDS = 300  # 5 minutes
    MAX_RETRIES = 3

    def __init__(self, name: str, project_root: Optional[Path] = None):
        self.name = name
        self.state_manager = get_state_manager()
        self.start_time = None
        self.scratchpad_initialized = False

    @property
    def scratchpad_path(self) -> Path:
        """Get path to this agent's scratchpad"""
        return self.state_manager.get_scratchpad_path(self.name)

    def initialize_scratchpad(self):
        """Initialize agent's scratchpad if not already done"""
        if self.scratchpad_initialized:
            return

        current_content = self.state_manager.read_scratchpad(self.name)
        if not current_content:
            # Create initial scratchpad
            header = f"""# {self.name.replace('-', ' ').title()} Agent Scratchpad

## Context
- Project: Rumfor Market Tracker
- Agent: {self.name}
- Initialized: {datetime.now().isoformat()}

## Responsibilities
{self._get_responsibilities()}

## Completed Tasks

## Current Tasks

## Next Actions

## Notes
"""
            self.state_manager.write_scratchpad(self.name, header)

        self.scratchpad_initialized = True

    def _get_responsibilities(self) -> str:
        """Get formatted responsibilities for this agent"""
        # This should be overridden by subclasses
        return "- Agent-specific responsibilities"

    def mark_started(self, message: str = ""):
        """Mark agent as started"""
        self.start_time = time.time()
        self.state_manager.update_agent_status(
            self.name,
            status="running",
            progress=10,
            message=message or f"Started {self.name} tasks"
        )
        self.initialize_scratchpad()
        self.log_to_scratchpad(f"## Started: {datetime.now().isoformat()}")
        if message:
            self.log_to_scratchpad(f"Message: {message}")

    def mark_progress(self, progress: int, message: str = ""):
        """Update progress (0-100)"""
        self.state_manager.update_agent_status(
            self.name,
            progress=min(100, max(0, progress)),
            message=message
        )
        if message:
            self.log_to_scratchpad(f"Progress {progress}%: {message}")

    def mark_complete(self, message: str = ""):
        """Mark agent as completed successfully"""
        duration = time.time() - (self.start_time or time.time())
        self.state_manager.update_agent_status(
            self.name,
            status="complete",
            progress=100,
            message=message or f"Completed in {duration:.1f}s"
        )
        self.log_to_scratchpad(f"## Completed: {datetime.now().isoformat()}")
        if message:
            self.log_to_scratchpad(f"Result: {message}")

    def mark_error(self, error_message: str):
        """Mark agent as failed with error"""
        self.state_manager.update_agent_status(
            self.name,
            status="error",
            progress=0,
            message=f"Error: {error_message}"
        )
        self.log_to_scratchpad(f"## Error: {datetime.now().isoformat()}")
        self.log_to_scratchpad(f"Error: {error_message}")

    def log_to_scratchpad(self, content: str):
        """Add content to scratchpad"""
        self.state_manager.append_scratchpad(self.name, f"\n{content}")

    def read_scratchpad(self) -> str:
        """Read current scratchpad content"""
        return self.state_manager.read_scratchpad(self.name)

    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return self.state_manager.get_agent_status(self.name)

    def is_cancelled(self) -> bool:
        """Check if agent should cancel (status changed externally)"""
        status = self.get_status()
        return status.get("status") not in ["running", "ready"]

    @abstractmethod
    def execute(self) -> AgentResult:
        """Execute the agent's main work. Must be implemented by subclasses."""
        pass

    def run(self) -> AgentResult:
        """Run the agent with error handling and status management"""
        try:
            self.mark_started()
            result = self.execute()

            if result.success:
                self.mark_complete(result.message)
            else:
                self.mark_error(result.message)

            return result

        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            self.mark_error(error_msg)
            return AgentResult(False, error_msg)

    def run_with_timeout(self) -> AgentResult:
        """Run agent with timeout protection"""
        import threading

        result = [None]
        exception = [None]

        def target():
            try:
                result[0] = self.run()
            except Exception as e:
                exception[0] = e
                result[0] = AgentResult(False, str(e))

        thread = threading.Thread(target=target, daemon=True)
        thread.start()
        thread.join(timeout=self.TIMEOUT_SECONDS)

        if thread.is_alive():
            self.mark_error(f"Agent timed out after {self.TIMEOUT_SECONDS} seconds")
            return AgentResult(False, f"Timeout after {self.TIMEOUT_SECONDS}s")

        if exception[0]:
            raise exception[0]

        return result[0]


class OrchestratorAgent(RalphAgent):
    """Special agent that orchestrates other agents"""

    def __init__(self):
        super().__init__("orchestrator")
        self.cycle_agents = [
            "research", "user-types", "market-types", "user-flows",
            "ui-styles", "community", "applications", "backend",
            "api", "simple-solution", "logic", "docs"
        ]

    def _get_responsibilities(self) -> str:
        return """
- Run full development cycles across all specialist agents
- Manage agent execution order and dependencies
- Track overall project progress
- Create checkpoints after each cycle
- Maintain orchestrator state
"""

    def execute(self) -> AgentResult:
        """Run a full Ralph Infinity cycle"""
        current_cycle = self.state_manager.get_orchestrator_status().get("current_cycle", 0) + 1

        self.state_manager.update_orchestrator_status(
            status="running",
            current_cycle=current_cycle,
            current_agent=None
        )

        self.log_to_scratchpad(f"\n## Cycle {current_cycle} Started: {datetime.now().isoformat()}")

        completed_agents = []
        failed_agents = []

        for agent_name in self.cycle_agents:
            if self.is_cancelled():
                return AgentResult(False, "Orchestrator was cancelled")

            self.state_manager.update_orchestrator_status(current_agent=agent_name)
            self.mark_progress(
                int((len(completed_agents) / len(self.cycle_agents)) * 100),
                f"Running {agent_name}"
            )

            # In a real implementation, this would instantiate and run the actual agent
            # For now, we'll simulate the agent running
            try:
                result = self._simulate_agent_run(agent_name)
                if result.success:
                    completed_agents.append(agent_name)
                    self.log_to_scratchpad(f"✓ {agent_name}: {result.message}")
                else:
                    failed_agents.append(agent_name)
                    self.log_to_scratchpad(f"✗ {agent_name}: {result.message}")
            except Exception as e:
                failed_agents.append(agent_name)
                self.log_to_scratchpad(f"✗ {agent_name}: Error - {str(e)}")

        # Create checkpoint
        self.state_manager.create_checkpoint(
            current_cycle,
            f"Completed {len(completed_agents)} agents, {len(failed_agents)} failed"
        )

        self.state_manager.update_orchestrator_status(
            status="idle",
            current_agent=None
        )

        message = f"Cycle {current_cycle} complete: {len(completed_agents)} succeeded, {len(failed_agents)} failed"
        return AgentResult(len(failed_agents) == 0, message)

    def _simulate_agent_run(self, agent_name: str) -> AgentResult:
        """Simulate running an agent (placeholder for actual agent implementations)"""
        # This is a placeholder - in real implementation, each agent would have its own class
        # For now, we'll just simulate success/failure randomly or based on agent type

        import random
        success = random.choice([True, False])  # 50% success rate for demo

        if success:
            return AgentResult(True, f"{agent_name} completed successfully")
        else:
            return AgentResult(False, f"{agent_name} encountered issues")