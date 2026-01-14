# Rumfor Infinity Rule List

> "I'm going to sleep, then when I wake up, I'm going to eat!" - Ralph Wiggum

A **file-based, serverless autonomous development system** that combines:
- **World Model Prompts** (DOT cards with AI context)
- **Agent Rules** (.roomodes definitions)
- **Frontend Controls** (UI to interact with both)

Works through **Roo Code's agent mode system** combined with file-based state management. No server required.

---

## What Is This?

Rumfor Infinity Rule List is a pattern for running continuous autonomous development cycles using AI coding assistants. It was developed for the Rumfor Market Tracker project but can be adapted to any full-stack web application.

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
# 1. Copy the agent mode definitions to your React project
cp .rumfor.roomodes your-project/

# 2. Copy the Rumfor Orchestrator files
cp -r rumfor_orchestrator/ your-project/tools/

# 3. Open the Infinity List UI
open tools/rumfor_world_model.html

# 4. Click an agent button to copy its prompt
# 5. Paste the prompt into Roo Code
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RUMFOR INFINITY RULE LIST                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  World Model    │  │  Agent Rules    │  │  Control Panel  │            │
│  │  (DOT Cards)    │  │  (.roomodes)    │  │  (HTML UI)      │            │
│  │                 │  │                 │  │                 │            │
│  │ • Project       │  │ • Frontend      │  │ • Click agent   │            │
│  │   Context       │  │ • Backend       │  │ • Copy prompt   │            │
│  │ • AI Prompts    │  │ • Testing       │  │ • Paste in Roo  │            │
│  │ • Tasks         │  │ • etc...        │  │ • View status    │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│           │                     │                     │                    │
│           └─────────────────────┴─────────────────────┘                    │
│                             │                                               │
│                             ▼                                               │
│              ┌─────────────────────────────┐                               │
│              │   Roo Code Agent Modes      │                               │
│              │   (.rumfor.roomodes)        │                               │
│              └─────────────────────────────┘                               │
│                             │                                               │
│                             ▼                                               │
│              ┌─────────────────────────────┐                               │
│              │   State Files               │                               │
│              │   • .rumfor/status.json     │                               │
│              │   • .rumfor/scratchpads/    │                               │
│              └─────────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 8 Specialist Agents

| Agent | Mode Slug | Specialty |
|-------|-----------|-----------|
| **Frontend Agent** | `rumfor-frontend` | React components, TypeScript, Vite builds |
| **Backend Agent** | `rumfor-backend` | Node.js, Express, MongoDB integration |
| **API Agent** | `rumfor-api` | REST endpoints, authentication, data modeling |
| **Styling Agent** | `rumfor-styling` | Tailwind CSS, UnoCSS, responsive design |
| **Testing Agent** | `rumfor-testing` | E2E tests, code quality, Playwright |
| **Security Agent** | `rumfor-security` | Dependency audits, code scanning, auth security |
| **Documentation Agent** | `rumfor-docs` | API docs, user guides, technical documentation |
| **Deployment Agent** | `rumfor-deploy` | CI/CD, GitLab Pages, containerization |

---

## How It Works

### 1. The Agent Mode System (.roomodes)

Each specialist agent is defined as a Roo Code custom mode with:

```yaml
- slug: rumfor-frontend
  name: "Frontend Agent"
  roleDefinition: |-
    You are the Frontend specialist for Rumfor Market Tracker.

    Your responsibilities:
    - React component development and optimization
    - TypeScript implementation and type safety
    - Vite configuration and build optimization
    - UI/UX implementation with Radix + custom styling

    Technology Stack:
    - React 18 with TypeScript
    - Zustand for state management
    - TanStack Query for data fetching
    - React Hook Form + Zod for forms
```

### 2. The Clipboard Workflow

1. User clicks an agent button in the UI
2. JavaScript generates a prompt for that agent
3. Prompt is copied to clipboard
4. User pastes into Roo Code
5. Roo Code switches to the appropriate agent mode
6. Agent executes its responsibilities

### 3. The State File System

Agents write their status to `.rumfor/status.json`:

```json
{
  "orchestrator": {
    "status": "idle",
    "current_cycle": 0,
    "current_agent": null
  },
  "agents": {
    "frontend": {
      "status": "complete",
      "progress": 100,
      "message": "Component optimization complete"
    }
  }
}
```

The UI reads this file (via generated `rumfor_status.js`) to display real-time status.

### 4. The Scratchpad System

Each agent has a persistent scratchpad at `.rumfor/scratchpads/{agent}_scratchpad.md`:

```markdown
# Frontend Agent Scratchpad

## Context
- Project: Rumfor Market Tracker
- Framework: React + TypeScript + Vite
- Styling: Tailwind CSS + UnoCSS

## Completed
- [2026-01-08 14:32] Optimized component bundle size
- [2026-01-08 14:35] Improved accessibility scores
- [2026-01-08 14:37] Added error boundaries

## In Progress
- Implementing lazy loading for vendor dashboard

## Next Actions
1. Add virtual scrolling for market lists
2. Optimize re-render cycles
3. Implement dark mode toggle
```

This provides persistent memory across cycles.

---

## Components

| Component | File | Purpose |
|-----------|------|---------|
| **Agent Base Class** | `rumfor_orchestrator/agent_base.py` | Base class for all agents with scratchpad and status methods |
| **State Manager** | `rumfor_orchestrator/state_manager.py` | Thread-safe file-based state management |
| **Infinity List UI** | `rumfor_world_model.html` | World Model visualization + Rumfor panel |
| **Control Panel** | `rumfor_control_panel.html` | Standalone agent control dashboard |
| **Status Compiler** | `compile_rumfor_status.py` | Generates JS from status.json |
| **Agent Modes** | `.rumfor.roomodes` | Roo Code agent definitions |

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

> "Everyone gets a turn, every cycle. No favorites."

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

Developed for the **Rumfor Market Tracker** project - A comprehensive platform for farmers market discovery and vendor applications.

Inspired by the "Ralph Wiggum" approach to autonomous development: simple, persistent, and always hungry for more progress.