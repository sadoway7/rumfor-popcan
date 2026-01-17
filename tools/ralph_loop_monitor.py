#!/usr/bin/env python3
"""
Ralph Loop Monitor - Autonomous loop execution for the Ralph Wiggum technique.

This script monitors AI output for continuation markers and automatically manages
the progression of Ralph loops. It ensures the AI can run autonomously without
manual intervention for each iteration.
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

class RalphLoopMonitor:
    """Monitors and manages autonomous Ralph loop execution."""

    def __init__(self, ralph_dir: Optional[Path] = None):
        self.ralph_dir = ralph_dir or Path(".ralph")
        self.loop_state_file = self.ralph_dir / "loop_state.json"
        self.monitor_active = False
        self.loop_manager_script = Path("tools/ralph_loop_manager.py")

    def start_monitoring(self):
        """Start monitoring for Ralph loop execution."""
        print("Starting Ralph Loop Monitor...")
        self.monitor_active = True

        while self.monitor_active:
            try:
                # Check for continuation markers in recent output
                if self.check_for_continuation():
                    self.process_continuation()
                elif self.check_for_completion():
                    self.process_completion()
                else:
                    time.sleep(2)  # Poll every 2 seconds
            except KeyboardInterrupt:
                print("\nMonitor stopped by user")
                break
            except Exception as e:
                print(f"Monitor error: {e}")
                time.sleep(5)

    def check_for_continuation(self) -> bool:
        """Check if there's a continuation marker indicating more work is needed."""
        # This would typically check AI output files or logs
        # For now, we'll check a marker file that the AI would create
        marker_file = self.ralph_dir / "continuation_marker.txt"
        if marker_file.exists():
            with open(marker_file, 'r') as f:
                content = f.read().strip()
                if content.startswith("RALPH_CONTINUE_ITERATION"):
                    return True
        return False

    def check_for_completion(self) -> bool:
        """Check if the completion promise has been found."""
        loop_state = self.load_loop_state()
        if not loop_state:
            return False

        # Check for completion in various places
        promise = loop_state.get("completion_promise", "")

        # Check marker file
        marker_file = self.ralph_dir / "completion_marker.txt"
        if marker_file.exists():
            with open(marker_file, 'r') as f:
                content = f.read()
                if promise in content:
                    return True

        # Check recent git commits for completion promise
        try:
            result = subprocess.run(
                ["git", "log", "--oneline", "-5"],
                capture_output=True, text=True, cwd="."
            )
            if promise in result.stdout:
                return True
        except:
            pass

        return False

    def process_continuation(self):
        """Process a continuation marker and prepare next iteration."""
        print("Continuation marker detected - preparing next iteration")

        # Read the continuation details
        marker_file = self.ralph_dir / "continuation_marker.txt"
        with open(marker_file, 'r') as f:
            continuation_content = f.read()

        # Extract remaining work and next focus from marker
        remaining_work = self.extract_remaining_work(continuation_content)

        # Increment iteration in loop state
        self.run_loop_manager_command(["increment"])

        # Update iteration notes with continuation info
        loop_state = self.load_loop_state()
        if loop_state:
            current_iter = loop_state.get("current_iteration", 1)
            self.run_loop_manager_command([
                "update-notes", str(current_iter - 1),  # Previous iteration
                "none", "none", ",".join(remaining_work), "Continuation marker detected"
            ])

        # Generate next iteration prompt
        self.generate_next_prompt()

        # Clean up marker file
        marker_file.unlink(missing_ok=True)

        print(f"Next iteration prepared for iteration {current_iter}")

    def process_completion(self):
        """Process completion detection and finalize the loop."""
        print("Completion promise detected - finalizing loop")

        loop_state = self.load_loop_state()
        if loop_state:
            # Mark as complete
            current_commit = self.get_current_commit()
            self.run_loop_manager_command(["complete", current_commit or ""])

            # Update final progress
            self.run_loop_manager_command([
                "update-progress", "100", "Task completed successfully"
            ])

        # Clean up marker files
        completion_marker = self.ralph_dir / "completion_marker.txt"
        continuation_marker = self.ralph_dir / "continuation_marker.txt"
        completion_marker.unlink(missing_ok=True)
        continuation_marker.unlink(missing_ok=True)

        print("Loop completed successfully!")
        self.monitor_active = False

    def generate_next_prompt(self):
        """Generate the next iteration prompt for the AI."""
        loop_state = self.load_loop_state()
        if not loop_state:
            return

        current_iter = loop_state.get("current_iteration", 1)
        task = loop_state.get("task", "")
        promise = loop_state.get("completion_promise", "")
        max_iter = loop_state.get("max_iterations", 30)

        # Get context from previous iterations
        context_parts = []
        iteration_notes = loop_state.get("iteration_notes", {})

        for i in range(1, current_iter):
            iter_key = str(i)
            if iter_key in iteration_notes:
                notes = iteration_notes[iter_key]
                completed = notes.get("completed", [])
                attempted = notes.get("attempted", [])
                remaining = notes.get("remaining", [])

                context_parts.append(f"Iteration {i}:")
                if completed:
                    context_parts.append(f"  ✓ Completed: {', '.join(completed)}")
                if attempted:
                    context_parts.append(f"  ⚠ Attempted: {', '.join(attempted)}")
                if remaining:
                    context_parts.append(f"  → Remaining: {', '.join(remaining)}")

        context = "\n".join(context_parts) if context_parts else "No previous iterations"

        prompt = f"""I want to run a Ralph Loop iteration for: {task}

Context from previous iterations:
{context}

Current iteration: {current_iter}/{max_iter}
Completion promise: {promise}

Please execute this iteration of the task, building on previous work.
When the task is completely done, output: {promise}

Switch to the ralph-loop mode and execute this iteration."""

        # Save prompt to clipboard or file for AI to use
        prompt_file = self.ralph_dir / "next_iteration_prompt.txt"
        with open(prompt_file, 'w') as f:
            f.write(prompt)

        print(f"Next iteration prompt saved to {prompt_file}")

    def extract_remaining_work(self, continuation_content: str) -> list:
        """Extract remaining work items from continuation marker."""
        # Parse the continuation content to extract remaining work
        remaining = []

        # Look for patterns like "Remaining:" or "Next focus:"
        lines = continuation_content.split('\n')
        in_remaining = False

        for line in lines:
            line = line.strip()
            if line.lower().startswith(('remaining:', 'next focus:', 'remaining work:')):
                in_remaining = True
                # Extract items after the label
                items_part = line.split(':', 1)[1].strip() if ':' in line else line
                remaining.extend([item.strip('- •').strip() for item in items_part.split(',') if item.strip()])
            elif in_remaining and line and not line.startswith('RALPH_'):
                # Continue collecting items until next marker
                remaining.extend([item.strip('- •').strip() for item in line.split(',') if item.strip()])
            elif line.startswith('RALPH_'):
                # Hit another marker, stop
                break

        return [item for item in remaining if item]  # Filter out empty items

    def get_current_commit(self) -> Optional[str]:
        """Get the current git commit hash."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                capture_output=True, text=True, cwd="."
            )
            return result.stdout.strip() if result.returncode == 0 else None
        except:
            return None

    def load_loop_state(self) -> Optional[Dict[str, Any]]:
        """Load the current loop state."""
        if not self.loop_state_file.exists():
            return None

        try:
            with open(self.loop_state_file, 'r') as f:
                return json.load(f)
        except:
            return None

    def run_loop_manager_command(self, args: list):
        """Run a command using the loop manager script."""
        cmd = [sys.executable, str(self.loop_manager_script)] + args
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Loop manager command failed: {result.stderr}")
            return result.returncode == 0
        except Exception as e:
            print(f"Error running loop manager: {e}")
            return False

def main():
    """Command-line interface for Ralph Loop Monitor."""
    if len(sys.argv) < 2:
        print("Usage: python ralph_loop_monitor.py <command>")
        print("Commands:")
        print("  start    - Start monitoring for loop execution")
        print("  check    - Check once for continuation/completion")
        print("  prompt   - Generate next iteration prompt")
        return

    monitor = RalphLoopMonitor()
    command = sys.argv[1]

    if command == "start":
        monitor.start_monitoring()
    elif command == "check":
        if monitor.check_for_continuation():
            print("Continuation marker found")
            monitor.process_continuation()
        elif monitor.check_for_completion():
            print("Completion promise found")
            monitor.process_completion()
        else:
            print("No markers found")
    elif command == "prompt":
        monitor.generate_next_prompt()
        print("Next iteration prompt generated")

if __name__ == "__main__":
    main()