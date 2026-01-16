"""Scratchpad utilities for persistent agent memory."""

from __future__ import annotations

from pathlib import Path


class Scratchpad:
    def __init__(self, path: Path):
        self.path = path

    def read(self) -> str:
        if not self.path.exists():
            return ""
        return self.path.read_text(encoding="utf-8")

    def write(self, content: str) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(content, encoding="utf-8")

    def update_section(self, section: str, content: str) -> None:
        current = self.read()
        header = f"## {section}"
        if header not in current:
            updated = (current.rstrip() + "\n\n" + header + "\n" + content + "\n").lstrip()
            self.write(updated)
            return

        parts = current.split(header)
        before = parts[0].rstrip()
        after = header.join(parts[1:])
        after_lines = after.splitlines()
        # remove existing section content until next header
        trimmed_after = []
        skipping = True
        for line in after_lines:
            if skipping and line.strip().startswith("## "):
                skipping = False
            if not skipping:
                trimmed_after.append(line)
        rebuilt = "\n".join(
            [before, "", header, content, ""] + trimmed_after
        ).lstrip()
        self.write(rebuilt)
