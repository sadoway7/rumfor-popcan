#!/usr/bin/env python3
"""
Ralph Loop Logger - Updates the live status dashboard with execution details.

This script logs Ralph loop activities to update the ralph_status.html dashboard
in real-time, providing live monitoring of autonomous execution.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

class RalphLogger:
    """Logs Ralph loop activities for live status monitoring."""

    def __init__(self, task_name: Optional[str] = None):
        self.task_name = task_name
        self.log_file = Path(".ralph/execution_log.json")
        self.status_file = Path("ralph_status_data.json")
        self.ensure_log_structure()

    def ensure_log_structure(self):
        """Ensure the log file and directory structure exists."""
        self.log_file.parent.mkdir(exist_ok=True)

        if not self.log_file.exists():
            initial_data = {
                "loops": {},
                "global_stats": {
                    "total_loops": 0,
                    "completed_loops": 0,
                    "total_iterations": 0,
                    "total_commands": 0,
                    "last_updated": datetime.now().isoformat()
                }
            }
            with open(self.log_file, 'w') as f:
                json.dump(initial_data, f, indent=2)

        # Also create/update the status data file for the HTML dashboard
        if not self.status_file.exists():
            with open(self.status_file, 'w') as f:
                json.dump({"loops": [], "last_updated": datetime.now().isoformat()}, f)

    def load_log_data(self) -> Dict[str, Any]:
        """Load the current log data."""
        try:
            with open(self.log_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {"loops": {}, "global_stats": {"total_loops": 0, "completed_loops": 0, "total_iterations": 0, "total_commands": 0}}

    def save_log_data(self, data: Dict[str, Any]):
        """Save the log data."""
        with open(self.log_file, 'w') as f:
            json.dump(data, f, indent=2)

        # Update the dashboard data file
        dashboard_data = {
            "loops": list(data["loops"].values()),
            "last_updated": datetime.now().isoformat()
        }
        with open(self.status_file, 'w') as f:
            json.dump(dashboard_data, f, indent=2)

    def initialize_loop(self, task_name: str, task: str, completion_promise: str, max_iterations: int):
        """Initialize logging for a new Ralph loop."""
        data = self.load_log_data()

        data["loops"][task_name] = {
            "task_name": task_name,
            "task": task,
            "completion_promise": completion_promise,
            "max_iterations": max_iterations,
            "current_iteration": 0,
            "status": "initializing",
            "start_time": datetime.now().isoformat(),
            "iteration_notes": {},
            "files_modified": [],
            "commands_executed": [],
            "overall_progress": "0% complete - Loop initialized"
        }

        data["global_stats"]["total_loops"] += 1
        data["global_stats"]["last_updated"] = datetime.now().isoformat()

        self.save_log_data(data)
        print(f"Initialized logging for Ralph loop: {task_name}")

    def update_iteration(self, task_name: str, iteration: int, completed: list = None,
                        attempted: list = None, remaining: list = None, verification_results: list = None):
        """Update iteration details."""
        data = self.load_log_data()

        if task_name not in data["loops"]:
            print(f"Warning: Loop {task_name} not found in logs")
            return

        loop = data["loops"][task_name]
        loop["current_iteration"] = iteration
        loop["status"] = "running"

        if "iteration_notes" not in loop:
            loop["iteration_notes"] = {}

        loop["iteration_notes"][str(iteration)] = {
            "completed": completed or [],
            "attempted": attempted or [],
            "remaining": remaining or [],
            "verification_results": verification_results or [],
            "timestamp": datetime.now().isoformat()
        }

        data["global_stats"]["total_iterations"] += 1
        data["global_stats"]["last_updated"] = datetime.now().isoformat()

        self.save_log_data(data)
        print(f"Updated iteration {iteration} for loop {task_name}")

    def log_file_modification(self, task_name: str, file_path: str):
        """Log a file modification."""
        data = self.load_log_data()

        if task_name not in data["loops"]:
            return

        loop = data["loops"][task_name]
        if file_path not in loop["files_modified"]:
            loop["files_modified"].append(file_path)
            self.save_log_data(data)

    def log_command_execution(self, task_name: str, command: str, result: str = "", success: bool = True):
        """Log a command execution."""
        data = self.load_log_data()

        if task_name not in data["loops"]:
            return

        loop = data["loops"][task_name]
        if "commands_executed" not in loop:
            loop["commands_executed"] = []

        loop["commands_executed"].append({
            "timestamp": datetime.now().isoformat(),
            "command": command,
            "result": result,
            "success": success
        })

        # Keep only last 20 commands to prevent log bloat
        if len(loop["commands_executed"]) > 20:
            loop["commands_executed"] = loop["commands_executed"][-20:]

        data["global_stats"]["total_commands"] += 1
        data["global_stats"]["last_updated"] = datetime.now().isoformat()

        self.save_log_data(data)

    def update_progress(self, task_name: str, progress: str):
        """Update overall progress for a loop."""
        data = self.load_log_data()

        if task_name not in data["loops"]:
            return

        data["loops"][task_name]["overall_progress"] = progress
        data["global_stats"]["last_updated"] = datetime.now().isoformat()

        self.save_log_data(data)

    def complete_loop(self, task_name: str, success: bool = True):
        """Mark a loop as completed."""
        data = self.load_log_data()

        if task_name not in data["loops"]:
            return

        loop = data["loops"][task_name]
        loop["status"] = "complete" if success else "error"
        loop["end_time"] = datetime.now().isoformat()
        loop["overall_progress"] = "100% complete - Task finished successfully" if success else "Failed - Task did not complete"

        if success:
            data["global_stats"]["completed_loops"] += 1

        data["global_stats"]["last_updated"] = datetime.now().isoformat()

        self.save_log_data(data)
        print(f"Marked loop {task_name} as {'complete' if success else 'error'}")

    def get_loop_status(self, task_name: str) -> Optional[Dict[str, Any]]:
        """Get the current status of a specific loop."""
        data = self.load_log_data()
        return data["loops"].get(task_name)

    def get_all_loops(self) -> Dict[str, Any]:
        """Get all loops and global stats."""
        return self.load_log_data()

def main():
    """Command-line interface for Ralph Logger."""
    if len(sys.argv) < 3:
        print("Usage: python ralph_logger.py <task_name> <command> [args...]")
        print("Commands:")
        print("  init <task> <completion_promise> <max_iterations>")
        print("  update-iteration <iteration> <completed> <attempted> <remaining> <verification>")
        print("  log-file <file_path>")
        print("  log-command <command> [result] [success]")
        print("  update-progress <progress_string>")
        print("  complete [success]")
        print("  status")
        return

    task_name = sys.argv[1]
    command = sys.argv[2]

    logger = RalphLogger(task_name)

    try:
        if command == "init":
            if len(sys.argv) < 6:
                print("Usage: init <task> <completion_promise> <max_iterations>")
                return
            task = sys.argv[3]
            promise = sys.argv[4]
            max_iter = int(sys.argv[5])
            logger.initialize_loop(task_name, task, promise, max_iter)

        elif command == "update-iteration":
            if len(sys.argv) < 7:
                print("Usage: update-iteration <iteration> <completed> <attempted> <remaining> <verification>")
                return
            iteration = int(sys.argv[3])
            completed = sys.argv[4].split(",") if sys.argv[4] != "none" else []
            attempted = sys.argv[5].split(",") if sys.argv[5] != "none" else []
            remaining = sys.argv[6].split(",") if sys.argv[6] != "none" else []
            verification = sys.argv[7].split(",") if len(sys.argv) > 7 and sys.argv[7] != "none" else []
            logger.update_iteration(task_name, iteration, completed, attempted, remaining, verification)

        elif command == "log-file":
            if len(sys.argv) < 4:
                print("Usage: log-file <file_path>")
                return
            logger.log_file_modification(task_name, sys.argv[3])

        elif command == "log-command":
            if len(sys.argv) < 4:
                print("Usage: log-command <command> [result] [success]")
                return
            command_text = sys.argv[3]
            result = sys.argv[4] if len(sys.argv) > 4 else ""
            success = sys.argv[5].lower() == "true" if len(sys.argv) > 5 else True
            logger.log_command_execution(task_name, command_text, result, success)

        elif command == "update-progress":
            if len(sys.argv) < 4:
                print("Usage: update-progress <progress_string>")
                return
            progress = sys.argv[3]
            logger.update_progress(task_name, progress)

        elif command == "complete":
            success = sys.argv[3].lower() == "true" if len(sys.argv) > 3 else True
            logger.complete_loop(task_name, success)

        elif command == "status":
            status = logger.get_loop_status(task_name)
            if status:
                print(json.dumps(status, indent=2))
            else:
                print(f"No loop found with name: {task_name}")

        else:
            print(f"Unknown command: {command}")

    except Exception as e:
        print(f"Error executing command {command}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()