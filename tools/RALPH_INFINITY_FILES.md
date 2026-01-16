# Ralph's Infinity Rule List - File Manifest

List of all files needed for the standalone repository.

---

## Documentation Files

```
docs/
├── README.md                    # Main documentation (use RALPH_INFINITY_README.md)
├── ARCHITECTURE.md              # System architecture (use RALPH_INFINITY_ARCHITECTURE.md)
├── SETUP.md                     # Setup guide (use RALPH_INFINITY_SETUP.md)
├── USAGE.md                     # Usage guide (use RALPH_INFINITY_USAGE.md)
└── CUSTOM_AGENTS.md             # Creating custom agents (use RALPH_INFINITY_CUSTOM_AGENTS.md)
```

---

## Core Python Files

```
ralph_orchestrator/
├── __init__.py
├── agent_base.py                # Base class for all agents
├── state_manager.py             # File-based state management
├── scratchpad.py                # Scratchpad I/O
├── orchestrator.py              # Main orchestrator loop
├── mode_generator.py            # Generates .roomodes from agent definitions
└── agents/
    ├── __init__.py
    ├── build_agent.py
    ├── assets_agent.py
    ├── world_data_agent.py
    ├── vr_agent.py
    ├── physics_agent.py
    ├── testing_agent.py
    ├── screenshot_agent.py
    └── documentation_agent.py
```

---

## UI Files

```
tools/
├── zoom_world_model.html        # Main UI (Infinity List + Ralph panel)
├── ralph_control_panel.html     # Standalone control dashboard
└── compile_ralph_status.py      # Generates JS from status.json
```

---

## Configuration Files

```
├── .roomodes                    # Roo Code agent mode definitions
└── .gitignore                   # Git ignore patterns
```

---

## .gitignore

```
# Ralph Orchestrator state files
.ralph/
ralph_status.js

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
.ralph/
├── scratchpads/                 # Agent persistent memory
├── checkpoints/                 # Git checkpoint metadata
├── metrics/                     # Performance metrics
└── knowledge/                   # Accumulated knowledge

cards/                          # World Model DOT files (user creates)
```

---

## Optional Files

### Example World Model Cards

```
cards/
├── example.dot                 # Example World Model structure
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
| `agent_base.py` | Base class for all agents | Yes |
| `state_manager.py` | Thread-safe file-based state management | Yes |
| `scratchpad.py` | Scratchpad file I/O | Yes |
| `orchestrator.py` | Main orchestrator loop | Yes |
| `mode_generator.py` | Generate .roomodes from definitions | Optional |
| `.roomodes` | Roo Code agent mode definitions | Yes |

### UI Files

| File | Purpose | Required |
|------|---------|----------|
| `zoom_world_model.html` | Main UI with World Model + Ralph panel | Yes |
| `ralph_control_panel.html` | Standalone control dashboard | Optional |
| `compile_ralph_status.py` | Generate JS from status.json | Yes |

### Agent Implementations

| File | Purpose | Required |
|------|---------|----------|
| `build_agent.py` | Build system specialist | Example |
| `assets_agent.py` | 3D asset specialist | Example |
| `world_data_agent.py` | World data specialist | Example |
| `vr_agent.py` | VR specialist | Example |
| `physics_agent.py` | Physics specialist | Example |
| `testing_agent.py` | Testing specialist | Example |
| `screenshot_agent.py` | Screenshot/visual verification | Example |
| `documentation_agent.py` | Documentation specialist | Example |

> **Note**: The agent implementations are examples. You can replace them with your own specialist agents.

---

## Setup Script Example

### setup.sh (Unix/Linux/macOS)

```bash
#!/bin/bash
# Ralph's Infinity Rule List - Setup Script

echo "Setting up Ralph's Infinity Rule List..."

# Create directories
mkdir -p .ralph/{scratchpads,checkpoints,metrics,knowledge}
mkdir -p cards
mkdir -p tools/ralph_orchestrator/agents

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || [ "$PYTHON_MINOR" -lt 10 ]; then
    echo "Error: Python 3.10+ required"
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install pyyaml graphviz

# Generate initial status
echo "Generating initial status..."
python3 tools/compile_ralph_status.py

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open tools/zoom_world_model.html in your browser"
echo "2. Click an agent button to copy its prompt"
echo "3. Paste into Roo Code"
```

### setup.ps1 (Windows)

```powershell
# Ralph's Infinity Rule List - Setup Script

Write-Host "Setting up Ralph's Infinity Rule List..." -ForegroundColor Green

# Create directories
New-Item -ItemType Directory -Force -Path .ralph\scratchpads
New-Item -ItemType Directory -Force -Path .ralph\checkpoints
New-Item -ItemType Directory -Force -Path .ralph\metrics
New-Item -ItemType Directory -Force -Path .ralph\knowledge
New-Item -ItemType Directory -Force -Path cards
New-Item -ItemType Directory -Force -Path tools\ralph_orchestrator\agents

# Check Python version
$pythonVersion = python --version 2>&1
Write-Host "Found Python: $pythonVersion"

# Create virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv

# Activate and install
.\venv\Scripts\Activate.ps1
Write-Host "Installing dependencies..."
pip install pyyaml graphviz

# Generate initial status
Write-Host "Generating initial status..."
python tools\compile_ralph_status.py

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open tools\zoom_world_model.html in your browser"
Write-Host "2. Click an agent button to copy its prompt"
Write-Host "3. Paste into Roo Code"
```

---

## Quick Start Commands

```bash
# Clone the repo
git clone https://github.com/your-username/ralph-infinity-rule-list.git
cd ralph-infinity-rule-list

# Run setup
# On Unix/Linux/macOS:
bash scripts/setup.sh
# On Windows:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Open the UI
open tools/zoom_world_model.html  # macOS
start tools/zoom_world_model.html # Windows
xdg-open tools/zoom_world_model.html # Linux
```

---

## Verifying Installation

```bash
# Check Python files exist
ls -la ralph_orchestrator/*.py

# Check UI files exist
ls -la tools/*.html

# Check .roomodes exists
cat .roomodes

# Generate initial status
python tools/compile_ralph_status.py

# Verify ralph_status.js was created
cat ralph_status.js
```

---

## File Sizes (Approximate)

| Category | Total Size |
|----------|------------|
| Documentation | ~100 KB |
| Python code | ~50 KB |
| HTML/JS/CSS | ~150 KB |
| Configuration | ~20 KB |
| **Total** | **~320 KB** |

The entire system is lightweight and can be easily forked, cloned, or shared.
