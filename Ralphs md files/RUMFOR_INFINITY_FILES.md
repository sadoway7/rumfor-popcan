# Rumfor Infinity Rule List - File Manifest

List of all files needed for the standalone Rumfor Market Tracker implementation.

---

## Documentation Files

```
docs/
├── README.md                    # Main documentation (use RUMFOR_INFINITY_README.md)
├── ARCHITECTURE.md              # System architecture (use RUMFOR_INFINITY_ARCHITECTURE.md)
├── SETUP.md                     # Setup guide (use RUMFOR_INFINITY_SETUP.md)
├── USAGE.md                     # Usage guide (use RUMFOR_INFINITY_USAGE.md)
└── CUSTOM_AGENTS.md             # Creating custom agents (use RUMFOR_INFINITY_CUSTOM_AGENTS.md)
```

---

## Core Python Files

```
rumfor_orchestrator/
├── __init__.py
├── agent_base.py                # Base class for all agents
├── state_manager.py             # File-based state management
├── scratchpad.py                # Scratchpad I/O
├── orchestrator.py              # Main orchestrator loop
├── mode_generator.py            # Generates .rumfor.roomodes from agent definitions
└── agents/
    ├── __init__.py
    ├── frontend_agent.py        # React/TypeScript/Vite specialist
    ├── backend_agent.py         # Node.js/Express/MongoDB specialist
    ├── api_agent.py             # REST API and authentication specialist
    ├── styling_agent.py         # Tailwind CSS/UnoCSS specialist
    ├── testing_agent.py         # E2E testing and quality specialist
    ├── security_agent.py        # Security scanning and audit specialist
    ├── documentation_agent.py   # API docs and user guides specialist
    └── deployment_agent.py      # CI/CD and deployment specialist
```

---

## UI Files

```
tools/
├── rumfor_world_model.html      # Main UI (Infinity List + Rumfor panel)
├── rumfor_control_panel.html    # Standalone control dashboard
└── compile_rumfor_status.py     # Generates JS from status.json
```

---

## Configuration Files

```
├── .rumfor.roomodes             # Roo Code agent mode definitions
└── .gitignore                   # Git ignore patterns
```

---

## .gitignore

```
# Rumfor Orchestrator state files
.rumfor/
rumfor_status.js

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo
```

---

## Directory Structure (Empty Directories to Create)

```
.rumfor/
├── scratchpads/                 # Agent persistent memory
│   ├── frontend_scratchpad.md
│   ├── backend_scratchpad.md
│   ├── api_scratchpad.md
│   ├── styling_scratchpad.md
│   ├── testing_scratchpad.md
│   ├── security_scratchpad.md
│   ├── documentation_scratchpad.md
│   └── deployment_scratchpad.md
├── checkpoints/                 # Git checkpoint metadata
│   └── checkpoints.json
├── metrics/                     # Performance metrics
│   └── metrics.json
└── knowledge/                   # Accumulated knowledge
    └── knowledge_base.json

cards/                          # World Model DOT files (user creates)
```

---

## Optional Files

### Example World Model Cards

```
cards/
├── market-tracker.dot          # Main application structure
└── README.md                   # How to create World Model cards
```

### Scripts

```
scripts/
├── setup.sh                    # Unix setup script
├── setup.ps1                   # Windows setup script
└── run_cycle.sh                # Run a full orchestrator cycle
```

---

## File Descriptions

### Core Files

| File | Purpose | Required |
|------|---------|----------|
| `agent_base.py` | Base class for all agents with scratchpad and status methods | Yes |
| `state_manager.py` | Thread-safe file-based state management | Yes |
| `scratchpad.py` | Scratchpad file I/O | Yes |
| `orchestrator.py` | Main orchestrator loop | Yes |
| `mode_generator.py` | Generate .rumfor.roomodes from definitions | Optional |
| `.rumfor.roomodes` | Roo Code agent definitions | Yes |

### UI Files

| File | Purpose | Required |
|------|---------|----------|
| `rumfor_world_model.html` | Main UI with World Model + Rumfor panel | Yes |
| `rumfor_control_panel.html` | Standalone control dashboard | Optional |
| `compile_rumfor_status.py` | Generate JS from status.json | Yes |

### Agent Implementations for Market Tracker

| File | Purpose | Focus Area |
|------|---------|------------|
| `frontend_agent.py` | React component development and TypeScript implementation | React 18, TypeScript, Vite 4, Zustand, TanStack Query |
| `backend_agent.py` | Node.js/Express server development | Express.js, MongoDB, authentication, API development |
| `api_agent.py` | REST API design and authentication | JWT, role-based access, API versioning, OpenAPI |
| `styling_agent.py` | CSS architecture and responsive design | Tailwind CSS, UnoCSS, Radix UI, accessibility |
| `testing_agent.py` | E2E testing and code quality | Playwright, ESLint, TypeScript, CI/CD integration |
| `security_agent.py` | Security auditing and vulnerability management | npm audit, GitLeaks, dependency scanning, authentication security |
| `documentation_agent.py` | Technical and API documentation | README generation, API docs, user guides |
| `deployment_agent.py` | Build optimization and deployment | GitLab CI/CD, Docker, performance optimization |

> **Note**: The agent implementations are specialized for market tracker technologies but follow the same base patterns.

---

## Setup Script Example

### setup.sh (Unix/Linux/macOS)

```bash
#!/bin/bash
# Rumfor Infinity Rule List - Setup Script for Market Tracker

echo "Setting up Rumfor Infinity Rule List for Market Tracker..."

# Create directories
mkdir -p .rumfor/{scratchpads,checkpoints,metrics,knowledge}
mkdir -p cards
mkdir -p tools/rumfor_orchestrator/agents

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || [ "$PYTHON_MINOR" -lt 10 ]; then
    echo "Error: Python 3.10+ required"
    exit 1
fi

# Check if Node.js project exists
if [ ! -f "package.json" ]; then
    echo "Error: Not in a Node.js project directory"
    exit 1
fi

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install pyyaml graphviz

# Generate initial status
echo "Generating initial agent status..."
python3 tools/compile_rumfor_status.py

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open tools/rumfor_world_model.html in your browser"
echo "2. Click an agent button to copy its prompt"
echo "3. Paste into Roo Code to start autonomous development"
echo ""
echo "Market Tracker specific agents ready:"
echo "- Frontend: React/TypeScript/Vite specialist"
echo "- Backend: Node.js/Express/MongoDB specialist"
echo "- API: Authentication and REST API specialist"
echo "- Styling: Tailwind/UnoCSS responsive design specialist"
```

### setup.ps1 (Windows)

```powershell
# Rumfor Infinity Rule List - Setup Script for Market Tracker

Write-Host "Setting up Rumfor Infinity Rule List for Market Tracker..." -ForegroundColor Green

# Create directories
New-Item -ItemType Directory -Force -Path .rumfor\scratchpads
New-Item -ItemType Directory -Force -Path .rumfor\checkpoints
New-Item -ItemType Directory -Force -Path .rumfor\metrics
New-Item -ItemType Directory -Force -Path .rumfor\knowledge
New-Item -ItemType Directory -Force -Path cards
New-Item -ItemType Directory -Force -Path tools\rumfor_orchestrator\agents

# Check Python version
$pythonVersion = python --version 2>&1
Write-Host "Found Python: $pythonVersion"

# Check for Node.js project
if (!(Test-Path "package.json")) {
    Write-Host "Error: Not in a Node.js project directory" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host "Creating Python virtual environment..."
python -m venv venv

# Activate and install
.\venv\Scripts\Activate.ps1
Write-Host "Installing Python dependencies..."
pip install pyyaml graphviz

# Generate initial status
Write-Host "Generating initial agent status..."
python tools/compile_rumfor_status.py

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open tools/rumfor_world_model.html in your browser"
Write-Host "2. Click an agent button to copy its prompt"
Write-Host "3. Paste into Roo Code to start autonomous development"
Write-Host ""
Write-Host "Market Tracker specific agents ready:"
Write-Host "- Frontend: React/TypeScript/Vite specialist"
Write-Host "- Backend: Node.js/Express/MongoDB specialist"
Write-Host "- API: Authentication and REST API specialist"
Write-Host "- Styling: Tailwind/UnoCSS responsive design specialist"
```

---

## Quick Start Commands

```bash
# Clone the repo
git clone https://gitlab.com/your-username/rumfor-market-tracker.git
cd rumfor-market-tracker

# Run setup
# On Unix/Linux/macOS:
bash scripts/setup.sh
# On Windows:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Open the UI
open tools/rumfor_world_model.html  # macOS
start tools/rumfor_world_model.html # Windows
xdg-open tools/rumfor_world_model.html # Linux
```

---

## Verifying Installation

```bash
# Check Python files exist
ls -la rumfor_orchestrator/*.py

# Check UI files exist
ls -la tools/*.html tools/*.py

# Check .rumfor.roomodes exists
cat .rumfor.roomodes

# Generate status file
python tools/compile_rumfor_status.py

# Verify rumfor_status.js was created
cat rumfor_status.js
```

---

## File Sizes (Approximate)

| Category | Total Size |
|----------|------------|
| Documentation | ~150 KB |
| Python orchestrator | ~60 KB |
| HTML/JS/CSS UI | ~180 KB |
| Configuration | ~25 KB |
| **Total** | **~415 KB** |

The system includes specialized agents for:
- **Frontend**: React 18 + TypeScript + Vite 4 stack
- **Backend**: Node.js + Express + MongoDB
- **API**: REST API with JWT authentication
- **Styling**: Tailwind + UnoCSS + Radix UI
- **Testing**: Playwright E2E + ESLint + Prettier
- **Security**: Dependency scanning + secret detection
- **Documentation**: Technical writing + API docs
- **Deployment**: GitLab CI/CD + Docker

---

## Agent Specialization Summary

Each agent is specialized for the market tracker's tech stack:

- **Frontend Agent**: React hooks, TypeScript strict mode, Vite optimizations
- **Backend Agent**: Express middleware, MongoDB aggregation, JWT handling
- **API Agent**: Role-based permissions, input validation, API versioning
- **Styling Agent**: Responsive design, accessibility, performance optimization
- **Testing Agent**: Playwright locators, CI pipeline integration, code coverage
- **Security Agent**: npm audit integration, authentication security, CORS setup
- **Documentation Agent**: Component documentation, API specifications, user guides
- **Deployment Agent**: Docker multi-stage builds, GitLab Pages, performance monitoring

The entire system is designed to work seamlessly with the market tracker's existing architecture and development workflow.