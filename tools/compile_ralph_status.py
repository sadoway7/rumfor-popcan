#!/usr/bin/env python3
"""
Ralph Status Compiler

Generates JavaScript status file for HTML dashboards from .ralph/status.json
"""

import json
import os
from pathlib import Path


def load_status():
    """Load status from .ralph/status.json"""
    ralph_dir = Path(".ralph")
    status_file = ralph_dir / "status.json"

    if not status_file.exists():
        print("Warning: .ralph/status.json not found, creating default")
        default_status = {
            "orchestrator": {
                "status": "idle",
                "current_cycle": 0,
                "current_agent": None,
                "start_time": 0,
                "last_update": 0
            },
            "agents": {
                "frontend": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "backend": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "api": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "styling": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "testing": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "security": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "documentation": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""},
                "deployment": {"status": "idle", "progress": 0, "message": "Ready", "last_run": None, "last_result": ""}
            }
        }
        ralph_dir.mkdir(exist_ok=True)
        with open(status_file, 'w') as f:
            json.dump(default_status, f, indent=2)
        return default_status

    with open(status_file, 'r') as f:
        return json.load(f)


def generate_js_status(status):
    """Generate JavaScript code from status dict"""
    js_template = f"""
// Ralph Status - Auto-generated from .ralph/status.json
// Generated: {os.popen('date').read().strip()}

window.ralphStatus = {json.dumps(status, indent=2)};

// Status helpers
window.getRalphStatus = function() {{
    return window.ralphStatus;
}};

window.getAgentStatus = function(agentSlug) {{
    return window.ralphStatus.agents[agentSlug] || null;
}};

window.getOrchestratorStatus = function() {{
    return window.ralphStatus.orchestrator;
}};

window.isAgentRunning = function(agentSlug) {{
    const agent = window.getAgentStatus(agentSlug);
    return agent && agent.status === 'running';
}};

window.getActiveAgents = function() {{
    return Object.entries(window.ralphStatus.agents)
        .filter(([_, status]) => status.status === 'running')
        .map(([slug, _]) => slug);
}};

window.formatTimeAgo = function(timestamp) {{
    if (!timestamp) return '';
    const now = Date.now() / 1000;
    const diff = Math.floor(now - timestamp);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
}};
"""
    return js_template


def main():
    """Main compilation function"""
    print("Ralph Status Compiler")
    print("====================")

    # Load status
    status = load_status()

    # Generate JS
    js_content = generate_js_status(status)

    # Write to current directory
    output_file = Path("ralph_status.js")
    with open(output_file, 'w') as f:
        f.write(js_content)

    # Write to tools directory
    tools_output = Path("tools/ralph_status.js")
    with open(tools_output, 'w') as f:
        f.write(js_content)

    print(f"Generated: {output_file}")
    print(f"Generated: {tools_output}")

    # Print summary
    orchestrator = status.get('orchestrator', {})
    agents = status.get('agents', {})

    print("\n--- Ralph Orchestrator Status ---")
    print(f"Status: {orchestrator.get('status', 'unknown').upper()}")
    print(f"Cycle: {orchestrator.get('current_cycle', 0)}")
    print(f"Current Agent: {orchestrator.get('current_agent') or 'None'}")

    running = len([a for a in agents.values() if a.get('status') == 'running'])
    complete = len([a for a in agents.values() if a.get('status') == 'complete'])
    errors = len([a for a in agents.values() if a.get('status') == 'error'])

    print(f"\nAgents: {running} running, {complete} complete, {errors} error")

    print("\nAgent Status:")
    for agent_slug, agent_data in agents.items():
        status_icon = {
            'running': '⚡',
            'complete': '✅',
            'error': '❌',
            'idle': '⏸️'
        }.get(agent_data.get('status', 'idle'), '❓')

        message = agent_data.get('message', 'Unknown')[:60]
        if len(message) == 60:
            message += '...'

        print(f"  {status_icon} {agent_slug}: {message}")


if __name__ == "__main__":
    main()