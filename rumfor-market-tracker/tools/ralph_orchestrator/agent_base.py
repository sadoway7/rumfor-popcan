"""Base classes and utilities for Ralph agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

from .scratchpad import Scratchpad
from .state_manager import RalphStateManager, get_state_manager


@dataclass
class AgentResult:
    success: bool = True
    progress_made: bool = False
    message: str = ""
    next_actions: List[str] = field(default_factory=list)
    files_modified: List[str] = field(default_factory=list)
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class RalphAgent:
    """Base class for Ralph Wiggum-style agents."""

    AGENT_NAME: str = "Base Agent"
    AGENT_SLUG: str = "base"
    TIMEOUT_SECONDS: int = 300
    MAX_RETRIES: int = 3

    def __init__(self, scratch_dir: Optional[Path] = None):
        project_root = Path(__file__).resolve().parents[2]
        self.project_root = project_root
        if scratch_dir is None:
            scratch_dir = project_root / ".ralph" / "scratchpads"
        scratch_dir.mkdir(parents=True, exist_ok=True)
        self.scratchpad = Scratchpad(scratch_dir / f"{self.AGENT_SLUG}_scratchpad.md")
        self._state_manager: RalphStateManager = get_state_manager(project_root)

    def take_turn(self) -> AgentResult:
        raise NotImplementedError

    def read_scratchpad(self) -> str:
        return self.scratchpad.read()

    def write_scratchpad(self, content: str) -> None:
        self.scratchpad.write(content)

    def update_scratchpad_section(self, section: str, content: str) -> None:
        self.scratchpad.update_section(section, content)

    def mark_start(self) -> None:
        self._state_manager.mark_agent_start(self.AGENT_SLUG)

    def mark_complete(self, result: str) -> None:
        self._state_manager.mark_agent_complete(self.AGENT_SLUG, result)

    def mark_error(self, error: str) -> None:
        self._state_manager.mark_agent_error(self.AGENT_SLUG, error)

    def update_progress(self, progress: int, message: str) -> None:
        self._state_manager.update_agent_status(
            self.AGENT_SLUG,
            progress=progress,
            message=message,
        )

    def create_result(
        self,
        *,
        success: bool = True,
        progress_made: bool = False,
        message: str = "",
        next_actions: Optional[List[str]] = None,
        files_modified: Optional[List[str]] = None,
        error: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentResult:
        return AgentResult(
            success=success,
            progress_made=progress_made,
            message=message,
            next_actions=next_actions or [],
            files_modified=files_modified or [],
            error=error,
            metadata=metadata or {},
        )
