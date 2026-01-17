# Ralph Wiggum Tools for RooCode

This directory contains the Ralph Wiggum technique implementation adapted for RooCode. The Ralph technique enables autonomous, iterative development loops that improve through iteration rather than requiring perfect first attempts.

## Files Overview

- `ralph_loop_manager.py` - Core state management for loops
- `check_completion.py` - Completion promise verification
- `ralph_loop.py` - Complete autonomous loop executor
- `start_ralph_loop.py` - Easy loop initialization
- `compile_ralph_status.py` - Status compilation for dashboards

## Quick Start

### 1. Initialize a Loop
```bash
python tools/start_ralph_loop.py "Implement user authentication" "AUTH_COMPLETE" 25
```

### 2. Switch to Ralph Mode in RooCode
Use RooCode's mode switching to enter `ralph-loop` mode.

### 3. Execute Autonomously
The mode will:
- Read current loop state
- Execute iterations toward completion
- Update progress and verify completion
- Continue until done or max iterations reached

## Manual Usage

### Initialize Loop
```bash
python tools/ralph_loop_manager.py init "task description" "COMPLETION_PROMISE" 30
```

### Check Current State
```bash
python tools/ralph_loop_manager.py context
```

### Update Progress
```bash
python tools/ralph_loop_manager.py update-notes 1 "completed auth logic" "attempted tests" "remaining: add validation" "tests failing"
```

### Check Completion
```bash
python tools/check_completion.py "COMPLETION_PROMISE"
```

### Increment Iteration
```bash
python tools/ralph_loop_manager.py increment
```

### Mark Complete
```bash
python tools/ralph_loop_manager.py complete
```

## State Files

Loop state is stored in `.ralph/task_{task_name}.json` with:
- Current iteration number
- Task description and completion promise
- Detailed progress notes per iteration
- Overall completion status
- Git commit references

## Integration with RooCode

The `ralph-loop` mode in `.roomodes` provides:
- Autonomous iteration execution
- State management integration
- Git-based checkpointing
- Completion verification
- Deterministic improvement through iteration

## Example Workflow

```bash
# 1. Start the loop
python tools/start_ralph_loop.py "Add dark mode toggle" "DARK_MODE_COMPLETE" 20

# 2. Switch to ralph-loop mode in RooCode
# (Mode will initialize and begin execution)

# 3. Monitor progress
python tools/ralph_loop_manager.py context

# 4. Check completion status
python tools/check_completion.py "DARK_MODE_COMPLETE"
```

## Best Practices

### Writing Completion Promises
- Use specific, verifiable strings (e.g., `AUTH_IMPLEMENTATION_COMPLETE`)
- Avoid vague terms like `DONE` or `FINISHED`
- Include measurable criteria when possible

### Task Definition
- Define clear success criteria upfront
- Break complex tasks into phases if needed
- Include testing and verification requirements

### Autonomous Execution
- Trust the iteration process to improve results
- Monitor through git history and state files
- Allow for imperfect early iterations

## Troubleshooting

### Loop Not Progressing
- Check `.ralph/` directory for state files
- Review git commits for actual changes made
- Verify completion checks are functioning

### State Issues
- Reinitialize loop if state becomes corrupted
- Use git history to recover previous states
- Check JSON syntax in state files

### Completion Detection
- Ensure completion promise is specific enough
- Add additional verification steps if needed
- Review what constitutes actual completion

## Advanced Usage

### Running Complete Autonomous Loops
```bash
python tools/ralph_loop.py "Complex migration task" "MIGRATION_COMPLETE" 50
```

### Custom Verification Scripts
Extend `check_completion.py` to add project-specific verification logic.

### Integration with CI/CD
Use the tools in automated pipelines for iterative development workflows.

## Philosophy

The Ralph technique embraces "deterministically bad" approaches that improve through iteration. Rather than requiring perfect first attempts, it accepts that AI agents will make mistakes but can self-correct through continuous loops.

This enables complex, multi-hour development tasks to run autonomously overnight, with the iteration process ensuring eventual correctness and completeness.