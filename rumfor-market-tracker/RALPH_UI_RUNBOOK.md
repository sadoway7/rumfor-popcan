# Ralph UI Runbook (Rumfor Market Tracker)

Use this file to ask an AI assistant to launch the Ralph UI and run a cycle.

## Open the UI (macOS)

```bash
open rumfor-market-tracker/tools/zoom_world_model.html
```

## See cards in the UI

Cards are listed in the main center panel of the World Model UI.
If you don’t see them, ensure the file exists at:

```
rumfor-market-tracker/cards/index.json
```

The UI loads that file and displays each card with its prompt.

## Open the Control Panel (optional)

```bash
open rumfor-market-tracker/tools/ralph_control_panel.html
```

## Regenerate status (if UI shows stale data)

```bash
python3 rumfor-market-tracker/tools/compile_ralph_status.py
```

## Run a full orchestrator cycle

```bash
python3 rumfor-market-tracker/tools/ralph_orchestrator/orchestrator.py
```

## Ask AI to run it (prompt)

```
Open the Ralph UI at rumfor-market-tracker/tools/zoom_world_model.html, then run a full Ralph Orchestrator cycle and report the status summary.
```
