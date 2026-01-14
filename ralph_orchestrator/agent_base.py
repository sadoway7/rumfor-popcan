"""
Rumfor Infinity Rule List - Agent Base Class

Base class for all Rumfor specialist agents with common functionality.
"""

import json
import os
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Any


@dataclass
class AgentResult:
    """Result returned by agent execution (enhanced Ralph-style)."""
    success: bool = True
    progress_made: bool = False
    message: str = ""
    next_actions: List[str] = None
    files_modified: List[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None

    # Ralph-style enhancements
    execution_time_seconds: Optional[float] = None
    cycle_number: Optional[int] = None
    agent_version: Optional[str] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    knowledge_gained: Optional[List[str]] = None
    suggestions_for_other_agents: Optional[Dict[str, str]] = None

    def __post_init__(self):
        if self.next_actions is None:
            self.next_actions = []
        if self.files_modified is None:
            self.files_modified = []
        if self.metadata is None:
            self.metadata = {}
        if self.performance_metrics is None:
            self.performance_metrics = {}
        if self.knowledge_gained is None:
            self.knowledge_gained = []
        if self.suggestions_for_other_agents is None:
            self.suggestions_for_other_agents = {}

    def add_performance_metric(self, key: str, value: Any) -> None:
        """Add a performance metric to the result."""
        self.performance_metrics[key] = value

    def add_knowledge(self, knowledge: str) -> None:
        """Add knowledge gained during execution."""
        self.knowledge_gained.append(knowledge)

    def add_suggestion_for_agent(self, agent_slug: str, suggestion: str) -> None:
        """Add a suggestion for another agent."""
        self.suggestions_for_other_agents[agent_slug] = suggestion

    def get_summary(self) -> str:
        """Get a comprehensive summary of the result."""
        summary_parts = []

        status = "✅ SUCCESS" if self.success else "❌ FAILED"
        summary_parts.append(f"{status}: {self.message}")

        if self.execution_time_seconds:
            summary_parts.append(f"⏱️ Execution time: {self.execution_time_seconds:.1f}s")

        if self.files_modified:
            summary_parts.append(f"📁 Files modified: {len(self.files_modified)}")

        if self.progress_made:
            summary_parts.append("🚀 Progress made (checkpoint created)")

        if self.next_actions:
            summary_parts.append(f"🎯 Next actions: {len(self.next_actions)} suggested")

        if self.knowledge_gained:
            summary_parts.append(f"🧠 Knowledge gained: {len(self.knowledge_gained)} items")

        if self.error:
            summary_parts.append(f"💥 Error: {self.error}")

        return " | ".join(summary_parts)


class RumforAgent(ABC):
    """Base class for all Rumfor specialist agents."""

    AGENT_NAME: str = "Base Agent"
    AGENT_SLUG: str = "base"
    TIMEOUT_SECONDS: int = 300
    MAX_RETRIES: int = 3

    def __init__(self, scratch_dir: Optional[Path] = None, config: Optional[Dict] = None):
        """Initialize the agent with configuration."""
        self.config = config or {}
        self.project_root = Path(__file__).parent.parent.parent

        # Set up scratchpad directory
        if scratch_dir is None:
            scratch_dir = self.project_root / ".rumfor" / "scratchpads"
        self.scratch_dir = scratch_dir
        self.scratch_dir.mkdir(parents=True, exist_ok=True)

        # State manager will be set by orchestrator
        self._state_manager = None

        # Scratchpad path
        self.scratchpad_path = self.scratch_dir / f"{self.slug}_scratchpad.md"

    @property
    def slug(self) -> str:
        """Get agent slug."""
        return self.__class__.AGENT_SLUG

    @property
    def name(self) -> str:
        """Get agent name."""
        return self.__class__.AGENT_NAME

    def set_state_manager(self, state_manager):
        """Set the state manager (called by orchestrator)."""
        self._state_manager = state_manager

    @abstractmethod
    def take_turn(self) -> AgentResult:
        """Execute one turn of this agent. Must be implemented by subclasses."""
        raise NotImplementedError("Agents must implement take_turn()")

    # Scratchpad methods
    def read_scratchpad(self) -> str:
        """Read the agent's scratchpad content."""
        if not self.scratchpad_path.exists():
            return self._create_initial_scratchpad()
        return self.scratchpad_path.read_text()

    def write_scratchpad(self, content: str) -> None:
        """Write content to the agent's scratchpad."""
        self.scratchpad_path.write_text(content)

    def update_scratchpad_section(self, section: str, content: str) -> None:
        """Update a specific section in the scratchpad."""
        current = self.read_scratchpad()
        # Simple section replacement - can be enhanced by subclasses
        self.write_scratchpad(f"{current}\n\n## {section}\n{content}")

    def _create_initial_scratchpad(self) -> str:
        """Create initial scratchpad content for new agents."""
        content = f"""# {self.name} Scratchpad

## Context
- Project: Rumfor Market Tracker
- Agent: {self.name}
- Focus: {self.slug} development and optimization

## Completed
- Agent initialized and ready for work

## In Progress
- Awaiting first task assignment

## Blocked On
- None

## Next Actions
- Review current project state
- Identify improvement opportunities
- Execute assigned responsibilities

## Notes
- Scratchpad created: {time.strftime('%Y-%m-%d %H:%M:%S')}
"""
        self.write_scratchpad(content)
        return content

    # Status methods
    def mark_start(self, message: str = "") -> None:
        """Mark agent as started."""
        if self._state_manager:
            status_msg = message or f"Running {self.name}..."
            self._state_manager.update_agent_status(self.slug, status="running", message=status_msg)

    def mark_complete(self, message: str = "") -> None:
        """Mark agent as completed."""
        if self._state_manager:
            status_msg = message or f"Completed {self.name} work"
            self._state_manager.update_agent_status(self.slug, status="complete", message=status_msg)

    def mark_error(self, error: str) -> None:
        """Mark agent as having an error."""
        if self._state_manager:
            self._state_manager.update_agent_status(self.slug, status="error", message=f"Error: {error}")

    def update_progress(self, progress: int, message: str = "") -> None:
        """Update agent progress (0-100)."""
        if self._state_manager:
            progress = max(0, min(100, progress))  # Clamp to 0-100
            status_msg = message or f"Progress: {progress}%"
            self._state_manager.update_agent_status(self.slug, progress=progress, message=status_msg)

    def create_result(
        self,
        success: bool = True,
        progress_made: bool = False,
        message: str = "",
        next_actions: List[str] = None,
        files_modified: List[str] = None,
        error: Optional[str] = None,
        metadata: Dict[str, Any] = None,
        execution_time_seconds: Optional[float] = None
    ) -> AgentResult:
        """Create and return an enhanced AgentResult (Ralph-style)."""
        # Get current state for additional metadata
        current_time = time.time()

        result = AgentResult(
            success=success,
            progress_made=progress_made,
            message=message,
            next_actions=next_actions or [],
            files_modified=files_modified or [],
            error=error,
            metadata=metadata or {},
            execution_time_seconds=execution_time_seconds,
            agent_version=self._get_agent_version()
        )

        # Add standard metadata
        result.metadata.update({
            "agent_slug": self.slug,
            "agent_name": self.name,
            "timestamp": current_time,
            "project_root": str(self.project_root)
        })

        # Add performance insights
        if execution_time_seconds:
            if execution_time_seconds > 300:  # 5 minutes
                result.add_performance_metric("execution_time_warning", "Long execution time")
            elif execution_time_seconds < 10:  # Very fast
                result.add_performance_metric("execution_time_note", "Very fast execution")

        # Add file operation metrics
        if files_modified and len(files_modified) > 10:
            result.add_performance_metric("files_modified_high", f"Modified {len(files_modified)} files")

        return result

    def _get_agent_version(self) -> str:
        """Get agent version (can be overridden by subclasses)."""
        return "1.0.0"

    def update_result_from_execution(self, result: AgentResult, start_time: float) -> AgentResult:
        """Update result with execution timing and additional metadata."""
        execution_time = time.time() - start_time
        result.execution_time_seconds = execution_time

        # Add performance analysis
        if execution_time > 60:  # More than 1 minute
            result.add_performance_metric("execution_analysis",
                                         f"Slow execution ({execution_time:.1f}s) - consider optimization")

        return result

    # Utility methods
    def get_project_info(self) -> Dict[str, Any]:
        """Get basic project information."""
        return {
            "name": "Rumfor Market Tracker",
            "tech_stack": ["React", "TypeScript", "Vite", "Node.js", "Express", "MongoDB"],
            "agent_count": 8,
            "orchestrator": "Rumfor Infinity Rule List"
        }

    def log_to_scratchpad(self, message: str, section: str = "Notes") -> None:
        """Log a message to the scratchpad in a specific section."""
        current = self.read_scratchpad()
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"- [{timestamp}] {message}\n"

        # Find or create the section
        if f"## {section}" in current:
            # Append to existing section
            lines = current.split('\n')
            section_start = None
            for i, line in enumerate(lines):
                if line.startswith(f"## {section}"):
                    section_start = i
                    break

            if section_start is not None:
                # Find where this section ends
                next_section_start = len(lines)
                for i in range(section_start + 1, len(lines)):
                    if lines[i].startswith("## "):
                        next_section_start = i
                        break

                lines.insert(next_section_start, log_entry)
                self.write_scratchpad('\n'.join(lines))
        else:
            # Create new section
            self.write_scratchpad(f"{current}\n\n## {section}\n{log_entry}")

    def get_file_list(self, pattern: str = "*", directory: str = ".") -> List[Path]:
        """Get list of files matching a pattern in a directory."""
        path = self.project_root / directory
        if not path.exists():
            return []

        files = []
        for file_path in path.rglob(pattern):
            if file_path.is_file():
                files.append(file_path.relative_to(self.project_root))

        return files