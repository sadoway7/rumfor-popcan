# Ralph's Infinity Rule List - Usage Guide

How to use Ralph's Infinity Rule List day-to-day.

---

## The Basic Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     BASIC WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

1. OPEN UI
   └──> Open tools/zoom_world_model.html

2. SELECT TASK
   └──> Click a World Model card OR select an agent directly

3. COPY PROMPT
   └──> Click agent button
   └──> Prompt is copied to clipboard

4. PASTE IN ROO CODE
   └──> Paste the prompt
   └──> Roo Code switches to agent mode

5. AGENT EXECUTES
   └──> Agent performs work
   └──> Status updates automatically

6. REVIEW RESULTS
   └──> Check scratchpad for details
   └──> Check git for checkpoints
```

---

## Daily Usage

### Morning: Start a Cycle

1. **Open the dashboard**

```bash
open tools/ralph_control_panel.html
```

2. **Click "Run All Agents"**

This copies a prompt to run a full cycle:
```
I want to run the Ralph Orchestrator for Chimera VR.
Please run a complete development cycle with all 8 specialist agents...
```

3. **Paste into Roo Code**

The orchestrator will run each agent in sequence.

### During the Day: Run Specific Agents

#### Scenario: Build is Broken

1. Open `tools/zoom_world_model.html`
2. Click the **Build Agent** card (🔨)
3. Paste the copied prompt into Roo Code
4. Agent switches to `agent1-build` mode
5. Agent fixes the build

#### Scenario: Need New Assets

1. Navigate to "Assets" card in World Model
2. Click "📦 Run with Assets Agent"
3. Paste into Roo Code
4. Agent handles the asset pipeline

#### Scenario: Bug Found

1. Navigate to the relevant component in World Model
2. UI suggests appropriate agents based on card type
3. Click suggested agent button
4. Paste into Roo Code

### Evening: Review Progress

1. **Check scratchpads**

```bash
# See what each agent did today
cat .ralph/scratchpads/build_scratchpad.md
cat .ralph/scratchpads/vr_scratchpad.md
# etc.
```

2. **Review git checkpoints**

```bash
# Show today's agent commits
git log --since="today" --oneline

# Show checkpoints by agent
git log --grep="Build Agent" --oneline
git log --grep="VR Agent" --oneline
```

3. **Check status**

```bash
python tools/compile_ralph_status.py
```

---

## Using the Infinity List UI

### Navigating the World Model

```
┌─────────────────────────────────────────────────────────────┐
│                    INFINITY LIST UI                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐  ┌─────────────────────────────────────┐   │
│  │  LEFT     │  │         CENTER                      │   │
│  │  SIDEBAR  │  │    (Graph Visualization)            │   │
│  │           │  │                                     │   │
│  │ ROOT      │  │         ┌─────────┐                 │   │
│  │ ├─System  │  │         │ System  │                 │   │
│  │ │ └Core   │  │         └────┬────┘                 │   │
│  │ └─VR      │  │              │                      │   │
│  │           │  │         ┌────▼────┐                 │   │
│  │           │  │         │  Core   │                 │   │
│  │           │  │         └─────────┘                 │   │
│  │           │  │                                     │   │
│  └───────────┘  └─────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Left Sidebar (World Model Navigation)

- Click arrows to expand/collapse categories
- Click card names to view details
- Icons indicate card type:
  - 📁 Root
  - 📂 Category
  - 📄 Card

### Center (Graph Visualization)

- Shows the card hierarchy as a graph
- Click nodes to select cards
- Zoom in/out with mouse wheel
- Pan by dragging

### Right Sidebar (Ralph Panel)

Toggle with the 🤖 button:

```
┌─────────────────────────────┐
│  🤖 Ralph Orchestrator      │
├─────────────────────────────┤
│  Status: IDLE               │
│  Cycle: 5                   │
│  Current: -                 │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 🔨 Build            │   │
│  │ Ready               │   │
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ 📦 Assets           │   │
│  │ Converting glTF...  │   │
│  └─────────────────────┘   │
│  ... more agents ...       │
├─────────────────────────────┤
│  [Run All Agents]           │
│  [Refresh]                  │
└─────────────────────────────┘
```

---

## Prompt Templates

### Single Agent Prompt

When you click an agent card:

```
I want to run the Build Agent for Chimera VR.

Context from World Model card "System.Core.Renderer":
Fix the shadow rendering bug in the forward renderer.
Shadows are appearing as black boxes instead of soft shadows.

Please use this context while working as the Build Agent.

Switch to the agent1-build mode and complete the Build Agent's responsibilities.
```

### Full Orchestrator Prompt

When you click "Run All Agents":

```
I want to run the Ralph Orchestrator for Chimera VR.

Please run a complete development cycle with all 8 specialist agents:
1. Build Agent (agent1-build) - CMake, compilation, build system
2. Assets Agent (agent2-assets) - glTF models, textures, asset pipeline
3. World Data Agent (agent3-world) - YAML configs, orbital data, planetary systems
4. VR Agent (agent4-vr) - OpenXR, hand tracking, VR interactions
5. Physics Agent (agent5-physics) - Bullet3, orbital mechanics, collisions
6. Testing Agent (agent6-testing) - Unit tests, test failures, coverage
7. Screenshot Agent (agent8-screenshot) - Screenshots, visual verification
8. Documentation Agent (agent7-docs) - Status reports, API docs, project docs

Switch to the ralph-orchestrator mode and run a full cycle with all agents.
```

### Context-Aware Prompt

When you click "Run with [Agent]" on a card:

```
I want to run the VR Agent for Chimera VR.

Context from World Model card "VR.HandTracking":
Implement sub-millimeter hand tracking accuracy.
Current implementation has 5mm jitter, need to achieve 1mm.

Please use this context while working as the VR Agent.

Switch to the agent4-vr mode and complete the VR Agent's responsibilities.
```

---

## Working with Scratchpads

### Reading an Agent's Memory

```bash
# See what the Build Agent is working on
cat .ralph/scratchpads/build_scratchpad.md
```

Output:
```markdown
# Build Agent Scratchpad

## Context
- Project: Chimera VR
- Build System: CMake + bgfx

## Completed
- [2026-01-08 10:32] Fixed CMake configuration for VR rendering
- [2026-01-08 10:35] Added missing OpenXR dependencies

## In Progress
- Optimizing shader compilation (currently taking 45s)

## Blocked On
- Waiting for Assets Agent to provide new textures

## Next Actions
1. Investigate texture compression issues
2. Set up precompiled headers
```

### Editing Scratchpads

You can manually add context to scratchpads:

```bash
# Add a note for the VR Agent
echo "## Note for Agent\nThe user prefers 72fps over 90fps for better visual quality" >> .ralph/scratchpads/vr_scratchpad.md
```

### Archiving Old Scratchpads

```bash
# Archive scratchpads after N cycles
mv .ralph/scratchpads/build_scratchpad.md .ralph/scratchpads/archive/build_cycle_1-10.md
```

---

## Git Checkpoints

### Checkpoint Structure

Each agent creates checkpoints like:

```
build-2024-01-08-cycle5-fix-cmake-config
assets-2024-01-08-cycle5-convert-gltf-models
vr-2024-01-08-cycle5-improve-hand-tracking
```

### Finding Checkpoints

```bash
# List all checkpoints
git tag | grep -E "agent[0-9]|cycle"

# Show checkpoints for a specific agent
git tag | grep "build"

# Show changes in a checkpoint
git show build-2024-01-08-cycle5-fix-cmake-config
```

### Rolling Back

```bash
# Reset to before an agent's work
git reset --hard HEAD~1

# Or checkout a specific checkpoint
git checkout build-2024-01-08-cycle5-fix-cmake-config
```

### Creating Manual Checkpoints

```bash
# Create a checkpoint at any time
git tag manual-$(date +%Y-%m-%d)-descriptive-name
```

---

## Monitoring Progress

### Via the UI

1. Open `tools/zoom_world_model.html` or `tools/ralph_control_panel.html`
2. Click the 🤖 toggle button
3. Watch agent status cards update in real-time

### Via Command Line

```bash
# Compile and show status
python tools/compile_ralph_status.py

# Watch status file
watch -n 2 cat .ralph/status.json
```

### Via the Status JSON

```bash
# Check specific agent
python -c "import json; s=json.load(open('.ralph/status.json')); print(s['agents']['build'])"
```

---

## Common Workflows

### Workflow 1: Fix a Bug

```
1. Identify the bug's domain (e.g., VR, Physics, Build)
2. Navigate to relevant World Model card
3. Click the appropriate agent button
4. Paste prompt into Roo Code
5. Agent investigates and fixes
6. Review scratchpad for root cause analysis
7. Git checkpoint created automatically
```

### Workflow 2: Add a Feature

```
1. Create a new World Model card for the feature
2. Write clear requirements in the card's prompt
3. Click "Run with [Agent]" based on feature type
4. Agent implements the feature
5. Testing Agent verifies (run separately)
6. Documentation Agent updates docs
7. Screenshot Agent captures visual proof
```

### Workflow 3: Code Review

```
1. Run Testing Agent: "Run full test suite and report coverage"
2. Run Documentation Agent: "Review new code for documentation"
3. Run Build Agent: "Verify build succeeds with new code"
4. Review all scratchpads for findings
5. Create manual checkpoint if satisfied
```

### Workflow 4: Release Preparation

```
1. Run Build Agent: "Prepare release build"
2. Run Testing Agent: "Run full integration test suite"
3. Run Screenshot Agent: "Capture release screenshots"
4. Run Documentation Agent: "Update changelog and release notes"
5. Create release tag
```

### Workflow 5: Investigation

```
1. Identify issue (e.g., performance problem)
2. Create investigation card in World Model
3. Run relevant agent with investigation prompt
4. Agent updates scratchpad with findings
5. Follow-up with specialist agents as needed
6. Document findings in investigation card
```

---

## Tips and Best Practices

### Writing Good Card Prompts

**Bad:**
```
Fix the bug.
```

**Good:**
```
Shadows are appearing as black boxes in the forward renderer.
This only happens when:
- Directional light angle > 45 degrees
- Shadow map resolution > 2048
- Cascaded shadow maps are enabled

Expected: Soft shadow edges
Actual: Hard black rectangles

Files to investigate:
- src/renderer/ForwardRenderer.cpp
- src/renderer/ShadowSystem.cpp
```

### Running Agents in Sequence

Sometimes you need to chain agents:

```
1. Build Agent: "Update CMake for new dependency"
2. Build Agent: "Verify build succeeds"
3. Testing Agent: "Run tests for new dependency"
4. Documentation Agent: "Document the new dependency"
```

### Handling Failures

If an agent marks error:

1. Check the scratchpad for error details
2. Check `status.json` for error message
3. Review git diff to see what changed
4. Run agent again with context about the error
5. If persistent, manually fix and note in scratchpad

### Progress Tracking

After each cycle:

```bash
# What did we accomplish?
git log --since="yesterday" --grep="Agent" --oneline

# What's left to do?
cat .ralph/scratchpads/*/scratchpad.md | grep "## Next Actions"
```

---

## Keyboard Shortcuts (UI)

| Key | Action |
|-----|--------|
| `Ctrl+Shift+R` | Refresh status |
| `Ctrl+K` | Focus search (for cards) |
| `Escape` | Close details panel |
| `Arrow Keys` | Navigate card tree |
| `Enter` | Open selected card |
| `Space` | Toggle Ralph panel |

---

## Troubleshooting Common Issues

### Agent Stuck

```bash
# Check if agent is actually running
cat .ralph/status.json | grep current_agent

# Force reset agent status
python -c "import json; s=json.load(open('.ralph/status.json')); s['agents']['build']['status']='idle'; json.dump(s,open('.ralph/status.json','w'),indent=2)"
```

### Status Not Updating

```bash
# Regenerate ralph_status.js
python tools/compile_ralph_status.py

# Clear browser cache and reload
```

### Wrong Agent Mode

If Roo Code doesn't switch modes:

1. Check `.roomodes` syntax is valid
2. Verify mode slug matches exactly (e.g., `agent1-build`)
3. Restart Roo Code
4. Check Roo Code settings for agent mode support

---

## Advanced Usage

### Custom Agent Sequences

Create a script to run agents in custom order:

```bash
#!/bin/bash
# custom_cycle.sh

echo "Running custom agent sequence..."

# First, prepare
echo "Build Agent: Clean build" | pbcopy
echo "Paste into Roo Code and press Enter when done..."
read

# Then, specialized work
echo "VR Agent: Implement feature X" | pbcopy
echo "Paste into Roo Code and press Enter when done..."
read

# Finally, verify
echo "Testing Agent: Verify feature X" | pbcopy
echo "Paste into Roo Code and press Enter when done..."
read

echo "Custom cycle complete!"
```

### Integration with CI/CD

```yaml
# .github/workflows/ralph-cycle.yml
name: Ralph Cycle
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  ralph-cycle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Ralph Cycle
        run: |
          python tools/ralph_orchestrator/run_cycle.py
      - name: Upload scratchpads
        uses: actions/upload-artifact@v2
        with:
          name: scratchpads
          path: .ralph/scratchpads/
```

---

## Next Steps

- [Custom Agents Guide](CUSTOM_AGENTS.md) - Create your own specialist agents
- [Architecture](ARCHITECTURE.md) - Deep dive into system internals
- [Setup](SETUP.md) - Installation and configuration

---

## Quick Reference

| Task | How |
|------|-----|
| Run single agent | Click agent card → Paste in Roo Code |
| Run full cycle | Click "Run All" → Paste in Roo Code |
| Check progress | Open UI, look at Ralph panel |
| View agent memory | `cat .ralph/scratchpads/{agent}_scratchpad.md` |
| See what changed | `git log --grep="Agent"` |
| Reset stuck agent | Edit `.ralph/status.json`, set status to "idle" |
| Create checkpoint | `git tag manual-$(date +%Y-%m-%d)-name` |
