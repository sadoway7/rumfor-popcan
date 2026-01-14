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
    """Result returned by agent execution."""
    success: bool = True
    progress_made: bool = False
    message: str = ""
    next_actions: List[str] = None
    files_modified: List[str] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.next_actions is None:
            self.next_actions = []
        if self.files_modified is None:
            self.files_modified = []
        if self.metadata is None:
            self.metadata = {}


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
        metadata: Dict[str, Any] = None
    ) -> AgentResult:
        """Create and return an AgentResult."""
        return AgentResult(
            success=success,
            progress_made=progress_made,
            message=message,
            next_actions=next_actions or [],
            files_modified=files_modified or [],
            error=error,
            metadata=metadata or {}
        )

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