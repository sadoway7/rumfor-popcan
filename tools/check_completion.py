#!/usr/bin/env python3
"""
Completion Promise Detection - Verifies if Ralph loop tasks are complete.

This script checks for completion promises in various sources to determine
if a Ralph loop iteration has successfully completed its task.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional, Dict, Any

class CompletionDetector:
    """Detects completion promises in various sources."""

    def __init__(self, ralph_dir: Optional[Path] = None):
        self.ralph_dir = ralph_dir or Path(".ralph")

    def check_completion(self, promise: str, search_in: str = "all") -> Dict[str, Any]:
        """
        Check for completion promise in various sources.

        Args:
            promise: The completion promise string to search for
            search_in: Where to search ("all", "files", "commits", "markers")

        Returns:
            Dict with found status and verification details
        """
        results = {
            "promise": promise,
            "found": False,
            "locations": [],
            "verification_details": {}
        }

        if search_in in ["all", "markers"]:
            # Check completion marker files
            marker_result = self._check_marker_files(promise)
            if marker_result["found"]:
                results["found"] = True
                results["locations"].append("marker_file")
                results["verification_details"]["marker"] = marker_result

        if search_in in ["all", "commits"]:
            # Check recent git commits
            commit_result = self._check_git_commits(promise)
            if commit_result["found"]:
                results["found"] = True
                results["locations"].append("git_commit")
                results["verification_details"]["commit"] = commit_result

        if search_in in ["all", "files"]:
            # Check project files for completion promise
            file_result = self._check_project_files(promise)
            if file_result["found"]:
                results["found"] = True
                results["locations"].append("project_files")
                results["verification_details"]["files"] = file_result

        # Additional verification: run tests if they exist
        if results["found"]:
            test_result = self._run_verification_tests()
            results["verification_details"]["tests"] = test_result

        return results

    def _check_marker_files(self, promise: str) -> Dict[str, Any]:
        """Check completion marker files."""
        result = {"found": False, "files": []}

        # Check for completion marker
        completion_marker = self.ralph_dir / "completion_marker.txt"
        if completion_marker.exists():
            with open(completion_marker, 'r') as f:
                content = f.read()
                if promise in content:
                    result["found"] = True
                    result["files"].append(str(completion_marker))
                    result["content"] = content.strip()

        return result

    def _check_git_commits(self, promise: str) -> Dict[str, Any]:
        """Check recent git commits for completion promise."""
        result = {"found": False, "commits": []}

        try:
            # Get recent commits
            result_proc = subprocess.run(
                ["git", "log", "--oneline", "-10"],
                capture_output=True, text=True, cwd="."
            )

            if result_proc.returncode == 0:
                commits = result_proc.stdout.strip().split('\n')
                for commit_line in commits:
                    if promise in commit_line:
                        result["found"] = True
                        # Extract commit hash
                        commit_hash = commit_line.split()[0]
                        result["commits"].append(commit_hash)

                        # Get full commit message
                        msg_proc = subprocess.run(
                            ["git", "show", "--no-patch", "--format=%B", commit_hash],
                            capture_output=True, text=True, cwd="."
                        )
                        if msg_proc.returncode == 0:
                            result["commit_message"] = msg_proc.stdout.strip()
                        break

        except Exception as e:
            result["error"] = str(e)

        return result

    def _check_project_files(self, promise: str) -> Dict[str, Any]:
        """Check project files for completion promise."""
        result = {"found": False, "files": []}

        # Common files to check
        check_files = [
            "README.md",
            "CHANGELOG.md",
            "package.json",
            "src/**/*.ts",
            "src/**/*.tsx",
            "src/**/*.js",
            "src/**/*.jsx",
            "**/*.md",
            "**/*.txt"
        ]

        try:
            for pattern in check_files:
                # Use git ls-files to get tracked files matching pattern
                ls_proc = subprocess.run(
                    ["git", "ls-files", pattern],
                    capture_output=True, text=True, cwd="."
                )

                if ls_proc.returncode == 0:
                    files = ls_proc.stdout.strip().split('\n')
                    for file_path in files:
                        if file_path and os.path.exists(file_path):
                            try:
                                with open(file_path, 'r', encoding='utf-8') as f:
                                    content = f.read()
                                    if promise in content:
                                        result["found"] = True
                                        result["files"].append(file_path)
                                        # Don't read entire large files
                                        if len(content) < 1000:
                                            result["content_preview"] = content[:500] + "..." if len(content) > 500 else content
                            except (UnicodeDecodeError, IOError):
                                continue

        except Exception as e:
            result["error"] = str(e)

        return result

    def _run_verification_tests(self) -> Dict[str, Any]:
        """Run verification tests if they exist."""
        result = {"tests_run": False, "passed": False}

        # Check for common test commands
        test_commands = [
            ["npm", "test"],
            ["yarn", "test"],
            ["pytest"],
            ["python", "-m", "pytest"],
            ["go", "test"],
            ["cargo", "test"]
        ]

        for cmd in test_commands:
            try:
                # Check if command exists
                test_proc = subprocess.run(
                    cmd, capture_output=True, text=True, cwd=".",
                    timeout=30  # 30 second timeout
                )
                if test_proc.returncode == 0:
                    result["tests_run"] = True
                    result["passed"] = True
                    result["command"] = " ".join(cmd)
                    result["output"] = test_proc.stdout.strip()
                    break
                else:
                    result["tests_run"] = True
                    result["passed"] = False
                    result["command"] = " ".join(cmd)
                    result["error"] = test_proc.stderr.strip()
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue

        return result

def main():
    """Command-line interface for completion detection."""
    if len(sys.argv) < 2:
        print("Usage: python check_completion.py <promise> [search_in]")
        print("  promise: The completion promise string to search for")
        print("  search_in: Where to search (all|files|commits|markers)")
        return

    promise = sys.argv[1]
    search_in = sys.argv[2] if len(sys.argv) > 2 else "all"

    detector = CompletionDetector()
    results = detector.check_completion(promise, search_in)

    print(json.dumps(results, indent=2))

    # Exit with appropriate code
    sys.exit(0 if results["found"] else 1)

if __name__ == "__main__":
    main()