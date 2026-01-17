#!/usr/bin/env python3
"""
Ralph Status Compiler
Generates JavaScript files from .ralph/status.json for HTML dashboards
"""

import json
import os
from pathlib import Path

def compile_status():
    """Compile status.json into JavaScript files"""

    # Find project root (where .ralph exists)
    current_dir = Path(__file__).parent
    project_root = current_dir.parent

    status_file = project_root / ".ralph" / "status.json"
    if not status_file.exists():
        print(f"Error: {status_file} not found")
        return False

    # Read status
    try:
        with open(status_file, 'r') as f:
            status = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing {status_file}: {e}")
        return False

    # Generate JS content
    js_content = f"""// Ralph Status - Auto-generated from {status_file}
// Do not edit manually - run tools/compile_ralph_status.py to update

const ralphStatus = {json.dumps(status, indent=2)};

// Helper functions
function getOrchestratorStatus() {{
    return ralphStatus.orchestrator;
}}

function getAgentStatus(agentName) {{
    return ralphStatus.agents[agentName] || {{status: 'unknown'}};
}}

function getAllAgents() {{
    return Object.keys(ralphStatus.agents);
}}

function isOrchestratorIdle() {{
    return ralphStatus.orchestrator.status === 'idle';
}}

function getCurrentAgent() {{
    return ralphStatus.orchestrator.current_agent;
}}

function getRunningAgents() {{
    return Object.entries(ralphStatus.agents)
        .filter(([_, status]) => status.status === 'running')
        .map(([name, _]) => name);
}}

function getCompletedAgents() {{
    return Object.entries(ralphStatus.agents)
        .filter(([_, status]) => status.status === 'complete')
        .map(([name, _]) => name);
}}
"""

    # Write to project root
    root_js_file = project_root / "ralph_status.js"
    with open(root_js_file, 'w') as f:
        f.write(js_content)
    print(f"Generated: {root_js_file}")

    # Write to tools directory too
    tools_js_file = current_dir / "ralph_status.js"
    with open(tools_js_file, 'w') as f:
        f.write(js_content)
    print(f"Generated: {tools_js_file}")

    # Print status summary
    print("\n--- Ralph Orchestrator Status ---")
    orch = status['orchestrator']
    print(f"Status: {orch['status'].upper()}")
    print(f"Cycle: {orch['current_cycle']}")
    print(f"Current Agent: {orch['current_agent'] or 'None'}")

    agents = status['agents']
    running = sum(1 for a in agents.values() if a['status'] == 'running')
    complete = sum(1 for a in agents.values() if a['status'] == 'complete')
    print(f"\nAgents: {running} running, {complete} complete")

    for name, agent_status in agents.items():
        status_indicator = agent_status['status'].upper()
        progress = agent_status.get('progress', 0)
        message = agent_status.get('message', '')
        print(f"  {name}: {status_indicator} ({progress}%) - {message}")

    return True

if __name__ == "__main__":
    success = compile_status()
    exit(0 if success else 1)