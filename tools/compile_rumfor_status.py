#!/usr/bin/env python3
"""
Rumfor Infinity Rule List - Status Compiler

Compiles JSON status file into JavaScript for the HTML dashboard.
"""

import json
import os
from pathlib import Path


def compile_status():
    """Compile status from JSON to JavaScript."""
    project_root = Path(__file__).parent.parent

    # Input file
    status_file = project_root / ".rumfor" / "status.json"

    # Output files
    js_file = project_root / "rumfor_status.js"
    tools_js_file = project_root / "tools" / "rumfor_status.js"

    # Initialize default status if file doesn't exist
    if not status_file.exists():
        print(f"Status file not found: {status_file}")
        print("Creating initial status...")
        _create_initial_status(status_file)

    # Read status
    try:
        with open(status_file, 'r') as f:
            status = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error reading status file: {e}")
        return False

    # Generate JavaScript
    js_content = f"""// Rumfor Infinity Rule List - Generated Status
// Generated: {Path(__file__).name}
// Do not edit manually - edit .rumfor/status.json instead

const rumforStatus = {json.dumps(status, indent=2)};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = rumforStatus;
}}
"""

    # Write to both locations
    for output_file in [js_file, tools_js_file]:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(output_file, 'w') as f:
                f.write(js_content)
            print(f"Generated: {output_file}")
        except IOError as e:
            print(f"Error writing {output_file}: {e}")
            return False

    # Print summary
    print("\n--- Rumfor Orchestrator Status ---")
    orchestrator = status.get("orchestrator", {})
    agents = status.get("agents", {})

    print(f"Status: {orchestrator.get('status', 'unknown').upper()}")
    print(f"Cycle: {orchestrator.get('current_cycle', 0)}")
    print(f"Current Agent: {orchestrator.get('current_agent') or 'None'}")

    agents_running = sum(1 for agent in agents.values() if agent.get("status") == "running")
    agents_complete = sum(1 for agent in agents.values() if agent.get("status") == "complete")
    agents_error = sum(1 for agent in agents.values() if agent.get("status") == "error")

    print(f"\nAgents: {agents_running} running, {agents_complete} complete, {agents_error} error")

    # Show individual agent status
    for agent_name, agent_status in agents.items():
        status_indicator = agent_status.get("status", "unknown")
        progress = agent_status.get("progress", 0)
        message = agent_status.get("message", "")

        status_emoji = {
            "idle": "⏸️",
            "running": "🔄",
            "complete": "✅",
            "error": "❌"
        }.get(status_indicator, "❓")

        print(f"  {status_emoji} {agent_name}: {status_indicator} ({progress}%) - {message}")

    return True


def _create_initial_status(status_file: Path):
    """Create initial status file."""
    from rumfor_orchestrator.state_manager import RumforStateManager

    # Use the state manager to create initial status
    state_manager = RumforStateManager(status_file.parent)
    # The constructor will create the initial file


if __name__ == "__main__":
    success = compile_status()
    exit(0 if success else 1)