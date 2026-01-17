#!/usr/bin/env python3
"""
Ralph Loop Starter for RooCode Integration

This script provides an easy way to start Ralph loops from within RooCode.
It initializes the loop state and can optionally run the first iteration.

Usage:
    python tools/start_ralph_loop.py "task description" "completion promise" [max_iterations] [--run-first]
"""

import sys
import subprocess
from pathlib import Path

def start_ralph_loop(task: str, completion_promise: str, max_iterations: int = 30, run_first: bool = False):
    """
    Start a new Ralph loop with the given parameters.

    Args:
        task: Description of the task to complete
        completion_promise: String that indicates completion
        max_iterations: Maximum number of iterations
        run_first: Whether to run the first iteration immediately
    """

    print(f"🚀 Starting Ralph Loop")
    print(f"📋 Task: {task}")
    print(f"🎯 Completion Promise: {completion_promise}")
    print(f"🔄 Max Iterations: {max_iterations}")
    print()

    # Initialize the loop
    cmd = [
        "python3", "tools/ralph_loop_manager.py", "init",
        task, completion_promise, str(max_iterations)
    ]

    print("Initializing loop state...")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")

    if result.returncode != 0:
        print(f"❌ Failed to initialize loop: {result.stderr}")
        return False

    print("✅ Loop initialized successfully")
    print(result.stdout.strip())

    # Get initial context
    print("\n📊 Initial loop context:")
    context_cmd = [sys.executable, "tools/ralph_loop_manager.py", "context"]
    context_result = subprocess.run(context_cmd, capture_output=True, text=True, cwd=".")

    if context_result.returncode == 0:
        print(context_result.stdout.strip())
    else:
        print(f"Warning: Could not get context: {context_result.stderr}")

    if run_first:
        print("\n🔄 Running first iteration...")
        # Note: In actual RooCode usage, the mode would handle the iteration execution
        print("💡 In RooCode, switch to ralph-loop mode to execute iterations autonomously")
    else:
        print("\n💡 Switch to ralph-loop mode in RooCode to begin autonomous execution")

    return True

def main():
    """Command-line interface."""
    if len(sys.argv) < 3:
        print("Usage: python tools/start_ralph_loop.py <task> <completion_promise> [max_iterations] [--run-first]")
        print("\nExample:")
        print('python tools/start_ralph_loop.py "Implement user auth" "AUTH_COMPLETE" 25 --run-first')
        return

    task = sys.argv[1]
    completion_promise = sys.argv[2]
    max_iterations = 30
    run_first = False

    # Parse optional arguments
    for arg in sys.argv[3:]:
        if arg.isdigit():
            max_iterations = int(arg)
        elif arg == "--run-first":
            run_first = True

    success = start_ralph_loop(task, completion_promise, max_iterations, run_first)

    if success:
        print(f"\n🎯 Ralph loop '{task}' is ready!")
        print("Use RooCode's ralph-loop mode to execute autonomously.")
    else:
        print("\n❌ Failed to start Ralph loop")
        sys.exit(1)

if __name__ == "__main__":
    main()