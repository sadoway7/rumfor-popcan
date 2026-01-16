# Ralph's Infinity Rule List

> "I'm going to sleep, then when I wake up, I'm going to eat!" - Ralph Wiggum

A **file-based, serverless autonomous development system** that combines:
- **World Model Prompts** (DOT cards with AI context)
- **Agent Rules** (.roomodes definitions)
- **Frontend Controls** (UI to interact with both)

Works through **Roo Code's agent mode system** combined with file-based state management. No server required.

---

## What Is This?

Ralph's Infinity Rule List is a pattern for running continuous autonomous development cycles using AI coding assistants. It was developed for the Chimera VR project but can be adapted to any codebase.

### The Core Idea

Instead of trying to build a complex autonomous agent system with servers and APIs, we use:

1. **Simple file-based state** - JSON files that agents read/write
2. **Prompt templates** - Pre-defined prompts for each specialist agent
3. **Agent mode switching** - Using Roo Code's `.roomodes` system
4. **Visual feedback** - HTML dashboards that read the state files

The result: A multi-agent system that anyone can run, understand, and modify.

---

## Quick Start

```bash
# 1. Copy the agent mode definitions to your project
cp .roomodes your-project/

# 2. Copy the Ralph Orchestrator files
cp -r ralph_orchestrator/ your-project/tools/

# 3. Open the Infinity List UI
open tools/zoom_world_model.html

# 4. Click an agent button to copy its prompt
# 5. Paste the prompt into Roo Code
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RALPH'S INFINITY RULE LIST                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  World Model    │  │  Agent Rules    │  │  Control Panel  │            │
│  │  (DOT Cards)    │  │  (.roomodes)    │  │  (HTML UI)      │            │
│  │                 │  │                 │  │                 │            │
│  │ • Project       │  │ • Build Agent   │  │ • Click agent   │            │
│  │   Context       │  │ • Assets Agent  │  │ • Copy prompt   │            │
│  │ • AI Prompts    │  │ • VR Agent      │  │ • Paste in Roo  │            │
│  │ • Tasks         │  │ • etc...        │  │ • View status   │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│           │                     │                     │                    │
│           └─────────────────────┴─────────────────────┘                    │
│                             │                                               │
│                             ▼                                               │
│              ┌─────────────────────────────┐                               │
│              │   Roo Code Agent Modes      │                               │
│              │   (.roomodes switching)     │                               │
│              └─────────────────────────────┘                               │
│                             │                                               │
│                             ▼                                               │
│              ┌─────────────────────────────┐                               │
│              │   State Files               │                               │
│              │   • .ralph/status.json      │                               │
│              │   • .ralph/scratchpads/     │                               │
│              └─────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 8 Specialist Agents

| Agent | Mode Slug | Specialty |
|-------|-----------|-----------|
| **Build Agent** | `agent1-build` | CMake, compilation, build system |
| **Assets Agent** | `agent2-assets` | glTF models, textures, asset pipeline |
| **World Data Agent** | `agent3-world` | YAML configs, orbital data, planetary systems |
| **VR Agent** | `agent4-vr` | OpenXR, hand tracking, VR interactions |
| **Physics Agent** | `agent5-physics` | Bullet3, orbital mechanics, collisions |
| **Testing Agent** | `agent6-testing` | Unit tests, test failures, coverage |
| **Screenshot Agent** | `agent8-screenshot` | Screenshots, visual verification |
| **Documentation Agent** | `agent7-docs` | Status reports, API docs, project docs |

---

## How It Works

### 1. The Agent Mode System (`.roomodes`)

Each specialist agent is defined as a Roo Code custom mode with:

```yaml
- slug: agent1-build
  name: "Build Agent"
  roleDefinition: |-
    You are the Build System specialist for Chimera VR.
    Your responsibilities:
    - CMake configuration and generation
    - Compilation error diagnosis and fixing
    ...
  whenToUse: "CMake configuration, compilation errors, build fixes"
  groups: ["read", "edit", "command"]
```

### 2. The Clipboard Workflow

1. User clicks an agent button in the UI
2. JavaScript generates a prompt for that agent
3. Prompt is copied to clipboard
4. User pastes into Roo Code
5. Roo Code switches to the appropriate agent mode
6. Agent executes its responsibilities

### 3. The State File System

Agents write their status to `.ralph/status.json`:

```json
{
  "orchestrator": {
    "status": "idle",
    "current_cycle": 0,
    "current_agent": null
  },
  "agents": {
    "build": {
      "status": "complete",
      "progress": 100,
      "message": "Build completed successfully"
    }
  }
}
```

The UI reads this file (via generated `ralph_status.js`) to display real-time status.

### 4. The Scratchpad System

Each agent has a persistent scratchpad at `.ralph/scratchpads/{agent}_scratchpad.md`:

```markdown
# Build Agent Scratchpad

## Context
- Project: Chimera VR
- Build System: CMake + bgfx

## Completed
- Fixed CMake configuration for VR rendering
- Added missing OpenXR dependencies

## In Progress
- Optimizing shader compilation

## Next Actions
- Investigate texture compression issues
```

This provides persistent memory across cycles.

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| **Agent Base Class** | `ralph_orchestrator/agent_base.py` | Base class for all agents with scratchpad and status methods |
| **State Manager** | `ralph_orchestrator/state_manager.py` | Thread-safe file-based state management |
| **Infinity List UI** | `zoom_world_model.html` | World Model visualization + Ralph panel |
| **Control Panel** | `ralph_control_panel.html` | Standalone agent control dashboard |
| **Status Compiler** | `compile_ralph_status.py` | Generates JS from status.json |
| **Agent Modes** | `.roomodes` | Roo Code agent definitions |

---

## Why This Approach?

### Advantages

1. **No Server Needed** - Everything runs through file I/O
2. **Transparent** - You can read every state file and scratchpad
3. **Debuggable** - Each agent's work is logged and persistent
4. **Simple** - No complex orchestration, just prompts and modes
5. **Portable** - Works with any AI coding assistant that supports mode switching
6. **Observable** - HTML dashboards show exactly what's happening

### Philosophy

> "Everyone gets a turn, every cycle."

- Deterministic loops (no complex decision trees)
- Every agent runs in sequence (no parallelism headaches)
- Git checkpoints after each agent (easy recovery)
- Accumulate knowledge over time (scratchpads grow)

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Deep dive into system architecture
- [SETUP.md](SETUP.md) - Installation and configuration guide
- [USAGE.md](USAGE.md) - How to use the system day-to-day
- [CUSTOM_AGENTS.md](CUSTOM_AGENTS.md) - Creating your own specialist agents

---

## License

MIT License - Feel free to use this pattern in your own projects!

---

## Credits

Developed for the **Chimera VR** project - An open-source VR space simulator.

Inspired by the "Ralph Wiggum" approach to autonomous development: simple, persistent, and always hungry for more progress.
