# TASK EXECUTION SYSTEM - START HERE

**READ THIS FIRST before doing ANY work**

---

## 🚦 SIMPLE CHECKLIST (For AI Agents)

### BEFORE You Use `attempt_completion`, You MUST Complete ALL 3 Steps:

```
☐ Step 1: Update SYSTEMATIC_FIX_PLAN.md file
   ↳ Fill in completion notes section of the task
   ↳ Add files modified with line numbers
   ↳ Write summary (2-3 sentences)
   ↳ Document what worked/didn't work

☐ Step 2: Update update_todo_list tool  
   ↳ Change [ ] to [x] for completed task
   ↳ Add brief note: (file, time, result)

☐ Step 3: Use attempt_completion
   ↳ Report what you did

IF ANY BOX IS UNCHECKED → STOP, don't use attempt_completion yet!
```

---

## 📁 WHICH FILES TO READ

1. **[AI_AGENT_PROTOCOL.md](./AI_AGENT_PROTOCOL.md)** ← Read first (the rules)
2. **[SYSTEMATIC_FIX_PLAN.md](./SYSTEMATIC_FIX_PLAN.md)** ← Read second (the tasks)
3. **[AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md)** ← Read third (the context)

---

## ✅ CORRECT EXAMPLE

```markdown
# What the AI should do:

1. Do the work (edit files)
2. Update SYSTEMATIC_FIX_PLAN.md:
   ```
   ### Completion Notes
   **Completion Date**: 2026-01-18 18:35
   **Files Modified**: src/file.ts (line 1: changed X to Y)
   **Summary**: Fixed typo, app now compiles
   **Time Taken**: 1 minute
   ```
3. Update update_todo_list:
   ```
   - [x] TASK 1.1: Fix typo (file.ts:1, 1min, works now)
   ```
4. Use attempt_completion:
   ```
   "Completed TASK 1.1: Fixed typo in file.ts line 1.
   App now compiles. Details in SYSTEMATIC_FIX_PLAN.md."
   ```
```

---

## ❌ WRONG EXAMPLE (Don't Do This)

```markdown
# What the AI should NOT do:

1. Do the work (edit files)
2. Use attempt_completion immediately ← WRONG!
   (Skipped updating the plan files)
```

**Why This Is Wrong**: The next AI agent won't know what you did!

---

## 🎯 THE 3-FILE SYSTEM

### File 1: AI_AGENT_PROTOCOL.md (The Rules)
**Purpose**: Defines how AI agents must work  
**Update Frequency**: Rarely (only if rules need clarification)  
**Read**: Once at start of session  

### File 2: SYSTEMATIC_FIX_PLAN.md (The Tasks)
**Purpose**: Lists all tasks with detailed instructions  
**Update Frequency**: After EVERY task completion  
**Update What**: 
- Task status (TODO → IN_PROGRESS → DONE)
- Completion notes
- Progress dashboard
- Session log

### File 3: update_todo_list Tool (The Sidebar)
**Purpose**: Quick reference reminders in VSCode  
**Update Frequency**: After EVERY task completion  
**Update What**:
- `[ ]` to `[x]` for completed tasks
- Add brief note in parentheses

---

## 🔄 MANDATORY UPDATE SEQUENCE

**Every time you finish a task, do this IN ORDER**:

```
1. Edit SYSTEMATIC_FIX_PLAN.md
   ↓
2. Call update_todo_list
   ↓
3. Call attempt_completion
```

**Never skip steps. Never change the order.**

---

## 📝 WHAT TO DOCUMENT

When you complete a task, fill in these fields in SYSTEMATIC_FIX_PLAN.md:

```markdown
**Completion Date**: YYYY-MM-DD HH:MM
**Time Taken**: X minutes  
**Files Modified**: 
- path/to/file.ts (line X: what changed)
**Summary**: What you did (2-3 sentences)
**Validation Results**: Did tests pass?
**Next Task**: What's next
```

**If you don't fill in ALL fields → Task is not complete!**

---

## 🚀 QUICK START (First Time)

```bash
1. Read AI_AGENT_PROTOCOL.md (5 min)
2. Open SYSTEMATIC_FIX_PLAN.md 
3. Find first TODO task (TASK 1.1, 1.2, etc.)
4. Read task description
5. Do the work
6. Update SYSTEMATIC_FIX_PLAN.md with notes
7. Update update_todo_list
8. Use attempt_completion
```

---

## ⚠️ COMMON MISTAKES TO AVOID

❌ **Mistake 1**: Using attempt_completion without updating files
- **Fix**: Always update both files first

❌ **Mistake 2**: Only updating update_todo_list, not the plan file  
- **Fix**: Update SYSTEMATIC_FIX_PLAN.md first (it has the details)

❌ **Mistake 3**: Not filling in completion notes
- **Fix**: All fields are required, not optional

❌ **Mistake 4**: Skipping validation
- **Fix**: Run every validation step before marking DONE

---

## ✅ VERIFICATION CHECKLIST

Before using `attempt_completion`, verify:

- [ ] I updated completion notes in SYSTEMATIC_FIX_PLAN.md
- [ ] I filled in ALL required fields (date, time, files, summary)
- [ ] I called update_todo_list tool 
- [ ] I ran all validation steps
- [ ] I documented what I changed

**If ALL boxes checked → OK to use attempt_completion**

---

**Questions? Read AI_AGENT_PROTOCOL.md for full details.**
