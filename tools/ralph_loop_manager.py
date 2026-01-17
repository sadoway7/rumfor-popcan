#!/usr/bin/env python3
"""
Ralph Loop Manager - Autonomous loop state management for the Ralph Wiggum technique.

This script manages the .ralph/loop_state.json file, which serves as the single source of truth
for autonomous task iteration. The AI reads from and updates this file to maintain context
across iterations.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

class RalphLoopManager:
    """Manages autonomous loop state for the Ralph Wiggum technique."""

    def __init__(self, ralph_dir: Optional[Path] = None, task_name: Optional[str] = None):
        self.ralph_dir = ralph_dir or Path(".ralph")
        self.task_name = task_name  # If None, use current active task
        self.loop_state_file = None
        self.ensure_ralph_dir()
        self.find_or_create_task_file()

    def ensure_ralph_dir(self):
        """Ensure the .ralph directory exists."""
        self.ralph_dir.mkdir(exist_ok=True)

    def find_or_create_task_file(self):
        """Find the current active task file or create a new one."""
        if self.task_name:
            # Specific task requested
            self.loop_state_file = self.ralph_dir / f"task_{self.task_name}.json"
        else:
            # Look for active task (most recently modified .json file)
            json_files = list(self.ralph_dir.glob("task_*.json"))
            if json_files:
                # Find the most recent active task (status = "running")
                active_tasks = []
                for json_file in json_files:
                    try:
                        with open(json_file, 'r') as f:
                            data = json.load(f)
                            if data.get("status") == "running":
                                active_tasks.append((json_file, data.get("start_time", "")))
                    except:
                        continue

                if active_tasks:
                    # Sort by start time (most recent first)
                    active_tasks.sort(key=lambda x: x[1], reverse=True)
                    self.loop_state_file = active_tasks[0][0]
                else:
                    # No active tasks, use most recent file
                    self.loop_state_file = max(json_files, key=lambda f: f.stat().st_mtime)
            else:
                # No task files exist yet
                self.loop_state_file = None

    def initialize_loop(self, task: str, completion_promise: str, max_iterations: int = 30) -> Dict[str, Any]:
        """Initialize a new Ralph loop with the given parameters."""
        # Create unique task name from task content
        task_slug = re.sub(r'[^\w\s-]', '', task.lower())
        task_slug = re.sub(r'[-\s]+', '_', task_slug).strip('_')[:50]  # Max 50 chars
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        task_name = f"{task_slug}_{timestamp}"

        # Set the task file
        self.task_name = task_name
        self.loop_state_file = self.ralph_dir / f"task_{task_name}.json"

        loop_state = {
            "task_name": task_name,
            "task": task,
            "completion_promise": completion_promise,
            "max_iterations": max_iterations,
            "current_iteration": 1,
            "status": "running",
            "start_time": datetime.now().isoformat(),
            "last_commit": None,
            "iteration_notes": {},
            "overall_progress": "0% complete - Loop initialized",
            "task_history": [],
            "ai_instructions": {
                "read_first": [
                    "Read this entire file to understand the current task state",
                    "Check current_iteration to know which iteration you're on",
                    "Review iteration_notes from previous iterations to avoid repeating work",
                    "Check overall_progress to understand total completion status"
                ],
                "execution_steps": [
                    "Execute work for the current iteration based on remaining tasks",
                    "Focus on items listed in iteration_notes[current_iteration-1].remaining",
                    "Build upon work completed in previous iterations",
                    "Make incremental progress toward the overall task goal"
                ],
                "verification_steps": [
                    "Run tests if available to verify functionality",
                    "Check that builds/compilation succeed",
                    "Review code changes for completeness against requirements",
                    "Search project files for the completion_promise string",
                    "Critically assess if work is truly complete vs. superficially done"
                ],
                "update_requirements": [
                    "Update iteration_notes[current_iteration] with detailed progress:",
                    "  - completed: List of work successfully finished this iteration",
                    "  - attempted: Work tried but not fully successful",
                    "  - remaining: What still needs to be done for completion",
                    "  - verification_results: Test results, build status, functionality checks",
                    "Update overall_progress with current completion percentage and status summary",
                    "Commit changes with message: 'ralph-loop-iteration-{current_iteration}: {brief description}'"
                ],
                "completion_criteria": [
                    "Output the exact completion_promise string only when:",
                    "  - All planned work is finished",
                    "  - Verification checks pass",
                    "  - No remaining work items exist",
                    "  - The task is truly complete, not just partially done"
                ],
                "continuation_criteria": [
                    "Output RALPH_CONTINUE_ITERATION marker when:",
                    "  - More work is needed to complete the task",
                    "  - Current iteration made progress but task not finished",
                    "  - Include specific details about remaining work in the marker"
                ],
                "safety_limits": [
                    f"Do not exceed {max_iterations} total iterations",
                    "Each iteration should make tangible progress",
                    "If stuck, clearly document blocking issues in iteration notes"
                ]
            }
        }

        self.save_loop_state(loop_state)
        print(f"Initialized Ralph loop '{task_name}' for task: {task}")
        return loop_state

    def load_loop_state(self) -> Optional[Dict[str, Any]]:
        """Load the current loop state from file."""
        if not self.loop_state_file.exists():
            return None

        try:
            with open(self.loop_state_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error loading loop state: {e}")
            return None

    def save_loop_state(self, loop_state: Dict[str, Any]):
        """Save the loop state to file."""
        with open(self.loop_state_file, 'w') as f:
            json.dump(loop_state, f, indent=2)

    def update_iteration_notes(self, iteration: int, completed: list = None,
                             attempted: list = None, remaining: list = None,
                             verification_results: list = None):
        """Update the detailed notes for a specific iteration."""
        loop_state = self.load_loop_state()
        if not loop_state:
            print("No loop state to update")
            return

        if "iteration_notes" not in loop_state:
            loop_state["iteration_notes"] = {}

        iteration_key = str(iteration)
        if iteration_key not in loop_state["iteration_notes"]:
            loop_state["iteration_notes"][iteration_key] = {
                "completed": [],
                "attempted": [],
                "remaining": [],
                "verification_results": []
            }

        notes = loop_state["iteration_notes"][iteration_key]

        if completed:
            notes["completed"].extend(completed)
        if attempted:
            notes["attempted"].extend(attempted)
        if remaining:
            notes["remaining"] = remaining  # Replace remaining, don't append
        if verification_results:
            notes["verification_results"].extend(verification_results)

        self.save_loop_state(loop_state)
        print(f"Updated iteration {iteration} notes")

    def update_overall_progress(self, progress_percentage: str, summary: str):
        """Update the overall progress of the loop."""
        loop_state = self.load_loop_state()
        if not loop_state:
            print("No loop state to update")
            return

        loop_state["overall_progress"] = f"{progress_percentage}% complete - {summary}"
        self.save_loop_state(loop_state)
        print(f"Updated overall progress: {progress_percentage}%")

    def increment_iteration(self) -> bool:
        """Increment the current iteration counter."""
        loop_state = self.load_loop_state()
        if not loop_state:
            print("No loop state to increment")
            return False

        current = loop_state["current_iteration"]
        max_iter = loop_state["max_iterations"]

        if current >= max_iter:
            print(f"Maximum iterations ({max_iter}) reached")
            loop_state["status"] = "error"
            loop_state["overall_progress"] = f"Failed - Maximum iterations ({max_iter}) reached"
            self.save_loop_state(loop_state)
            return False

        loop_state["current_iteration"] = current + 1
        self.save_loop_state(loop_state)
        print(f"Incremented to iteration {current + 1}")
        return True

    def mark_complete(self, commit_hash: str = None):
        """Mark the loop as completed."""
        loop_state = self.load_loop_state()
        if not loop_state:
            print("No loop state to complete")
            return

        loop_state["status"] = "complete"
        loop_state["last_commit"] = commit_hash
        loop_state["overall_progress"] = "100% complete - Task finished successfully"
        self.save_loop_state(loop_state)
        print("Marked loop as complete")

    def get_current_iteration_context(self) -> Optional[Dict[str, Any]]:
        """Get context for the current iteration."""
        loop_state = self.load_loop_state()
        if not loop_state:
            return None

        current_iter = loop_state["current_iteration"]
        previous_notes = {}

        # Get notes from all previous iterations
        for i in range(1, current_iter):
            iter_key = str(i)
            if iter_key in loop_state.get("iteration_notes", {}):
                previous_notes[iter_key] = loop_state["iteration_notes"][iter_key]

        return {
            "task": loop_state["task"],
            "completion_promise": loop_state["completion_promise"],
            "current_iteration": current_iter,
            "max_iterations": loop_state["max_iterations"],
            "overall_progress": loop_state.get("overall_progress", ""),
            "previous_iteration_notes": previous_notes,
            "current_iteration_notes": loop_state.get("iteration_notes", {}).get(str(current_iter), {
                "completed": [],
                "attempted": [],
                "remaining": [],
                "verification_results": []
            })
        }

    def check_completion_promise(self, search_content: str = "") -> bool:
        """Check if the completion promise appears in the given content."""
        loop_state = self.load_loop_state()
        if not loop_state:
            return False

        promise = loop_state["completion_promise"]
        return promise in search_content

def main():
    """Command-line interface for Ralph Loop Manager."""
    if len(sys.argv) < 2:
        print("Usage: python ralph_loop_manager.py <command> [args...]")
        print("Commands:")
        print("  init <task> <completion_promise> [max_iterations]")
        print("  status")
        print("  update-notes <iteration> <completed> <attempted> <remaining> <verification>")
        print("  update-progress <percentage> <summary>")
        print("  increment")
        print("  complete [commit_hash]")
        print("  context")
        print("  check-promise <content>")
        print("  check-completion <content>  # JSON output for mode parsing")
        return

    manager = RalphLoopManager()
    command = sys.argv[1]

    if command == "init":
        if len(sys.argv) < 4:
            print("Usage: init <task> <completion_promise> [max_iterations]")
            return
        task = sys.argv[2]
        promise = sys.argv[3]
        max_iter = int(sys.argv[4]) if len(sys.argv) > 4 else 30
        manager.initialize_loop(task, promise, max_iter)

    elif command == "status":
        state = manager.load_loop_state()
        if state:
            print(json.dumps(state, indent=2))
        else:
            print("No loop state found")

    elif command == "update-notes":
        if len(sys.argv) < 7:
            print("Usage: update-notes <iteration> <completed> <attempted> <remaining> <verification>")
            return
        iteration = int(sys.argv[2])
        completed = sys.argv[3].split(",") if sys.argv[3] != "none" else []
        attempted = sys.argv[4].split(",") if sys.argv[4] != "none" else []
        remaining = sys.argv[5].split(",") if sys.argv[5] != "none" else []
        verification = sys.argv[6].split(",") if sys.argv[6] != "none" else []
        manager.update_iteration_notes(iteration, completed, attempted, remaining, verification)

    elif command == "update-progress":
        if len(sys.argv) < 4:
            print("Usage: update-progress <percentage> <summary>")
            return
        percentage = sys.argv[2]
        summary = sys.argv[3]
        manager.update_overall_progress(percentage, summary)

    elif command == "increment":
        success = manager.increment_iteration()
        print(f"Increment {'successful' if success else 'failed'}")

    elif command == "complete":
        commit_hash = sys.argv[2] if len(sys.argv) > 2 else None
        manager.mark_complete(commit_hash)

    elif command == "context":
        context = manager.get_current_iteration_context()
        if context:
            print(json.dumps(context, indent=2))
        else:
            print("No loop context available")

    elif command == "check-promise":
        if len(sys.argv) < 3:
            print("Usage: check-promise <content>")
            return
        content = sys.argv[2]
        found = manager.check_completion_promise(content)
        print(f"Completion promise {'found' if found else 'not found'}")

    elif command == "check-completion":
        # Alias for check-promise for backwards compatibility
        if len(sys.argv) < 3:
            print("Usage: check-completion <content>")
            return
        content = sys.argv[2]
        found = manager.check_completion_promise(content)
        # Output JSON for easier parsing by the mode
        result = {"found": found, "promise": manager.load_loop_state().get("completion_promise", ""), "searched_in": content[:100] + "..." if len(content) > 100 else content}
        print(json.dumps(result))

if __name__ == "__main__":
    main()