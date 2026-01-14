"""
Ralph Agent Scratchpad Management

Persistent memory system for Ralph agents. Each agent maintains a markdown
scratchpad that accumulates knowledge across development cycles.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime


class Scratchpad:
    """
    Markdown-based persistent memory for Ralph agents.

    Accumulates knowledge, context, and findings across development cycles.
    """

    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Create scratchpad file if it doesn't exist."""
        if not self.file_path.exists():
            header = f"""# Ralph Agent Scratchpad

## Context
- Project: New Project
- Agent: New Agent
- Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Completed

## In Progress

## Blocked On

## Next Actions

## Notes
"""
            with open(self.file_path, 'w', encoding='utf-8') as f:
                f.write(header)

    def read(self) -> str:
        """Read the complete scratchpad content."""
        with open(self.file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def write(self, content: str) -> None:
        """Write complete content to scratchpad."""
        with open(self.file_path, 'w', encoding='utf-8') as f:
            f.write(content)

    def append_line(self, line: str) -> None:
        """Append a line to the scratchpad."""
        with open(self.file_path, 'a', encoding='utf-8') as f:
            f.write(line + '\n')

    def update_section(self, section_title: str, content: str) -> None:
        """Update or add a section in the scratchpad."""
        current_content = self.read()

        # Find section markers
        section_start = f"## {section_title}\n"
        next_section_pattern = "## "

        # If section exists, replace it
        if section_start in current_content:
            lines = current_content.split('\n')
            start_idx = -1
            end_idx = -1

            for i, line in enumerate(lines):
                if line == f"## {section_title}":
                    start_idx = i
                    # Find next section or end
                    for j in range(i+1, len(lines)):
                        if lines[j].startswith("## "):
                            end_idx = j
                            break
                    else:
                        end_idx = len(lines)
                    break

            if start_idx >= 0:
                # Replace section
                lines[start_idx:end_idx] = [f"## {section_title}", content]
                self.write('\n'.join(lines))
        else:
            # Add new section
            self.append_line(f"\n## {section_title}\n{content}")

    def add_completed_item(self, item: str, timestamp: bool = True) -> None:
        """Add an item to the Completed section."""
        timestamp_str = ""
        if timestamp:
            timestamp_str = f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] "

        self.append_line(f"- {timestamp_str}{item}")

    def add_note(self, note: str) -> None:
        """Add a note to the Notes section."""
        # Find notes section and append
        content = self.read()
        if "## Notes" in content:
            # Append to existing notes section
            self.append_line(note)
        else:
            # Add notes section
            self.update_section("Notes", note)


class ScratchpadManager:
    """
    Manager for agent scratchpads.

    Provides convenient methods for managing multiple scratchpads.
    """

    def __init__(self, scratch_dir: Path):
        self.scratch_dir = scratch_dir
        self.scratch_dir.mkdir(parents=True, exist_ok=True)

    def get_scratchpad(self, agent_slug: str) -> Scratchpad:
        """Get scratchpad for an agent."""
        return Scratchpad(self.scratch_dir / f"{agent_slug}_scratchpad.md")

    def list_scratchpads(self) -> list[str]:
        """List all available scratchpad files."""
        return [f.stem for f in self.scratch_dir.glob("*_scratchpad.md")]

    def archive_scratchpad(self, agent_slug: str, archive_name: str) -> None:
        """Archive a scratchpad."""
        source = self.scratch_dir / f"{agent_slug}_scratchpad.md"
        archive_dir = self.scratch_dir / "archive"
        archive_dir.mkdir(exist_ok=True)
        target = archive_dir / f"{archive_name}.md"

        if source.exists():
            import shutil
            shutil.copy2(source, target)