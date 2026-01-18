# AI AGENT EXECUTION PROTOCOL - MANDATORY INSTRUCTIONS

**Version**: 1.0  
**Last Updated**: 2026-01-18  
**Applies To**: All AI agents working on Rumfor Market Tracker  
**Enforcement**: STRICT - Violations will cause task rejection  

---

# ⚠️ CRITICAL: READ THIS BEFORE DOING ANYTHING

This document contains **IMMUTABLE RULES** for how you, the AI agent, must interact with the task list in [`SYSTEMATIC_FIX_PLAN.md`](./SYSTEMATIC_FIX_PLAN.md).

**THESE ARE NOT SUGGESTIONS. THESE ARE REQUIREMENTS.**

Failure to follow these rules will result in:
- ❌ Wasted work that gets reverted
- ❌ Lost progress tracking
- ❌ Confusion for next AI agent
- ❌ Breaking the development workflow

---

# 🎯 YOUR CORE RESPONSIBILITIES

## As an AI Agent, You Must:

1. ✅ **Read the task list** before doing any work
2. ✅ **Update the task list** as you progress
3. ✅ **Document your changes** in task notes
4. ✅ **Update status BEFORE completing** your session
5. ✅ **Leave clear notes** for the next agent
6. ✅ **Track files changed** with line numbers
7. ✅ **Create new tasks** when issues are discovered
8. ✅ **Follow the dependency chain** (don't skip ahead)

---

# 📋 TASK LIST UPDATE PROTOCOL

## RULE 1: MANDATORY 4-STEP UPDATE SEQUENCE (NEVER SKIP THIS)

**🚨 CRITICAL: After completing a task, follow ALL 4 steps in this EXACT order:**

```
STEP 1 (REQUIRED): Update SYSTEMATIC_FIX_PLAN.md file
   ↳ Find the "Completion Notes" section for your task
   ↳ Fill in ALL fields:
      - Completion Date: YYYY-MM-DD HH:MM
      - Time Taken: X minutes
      - Files Modified: path/to/file.ts (line X: what changed)
      - Summary: 2-3 sentences explaining what you did
      - Validation Results: [x] or [ ] for each check
      - What Worked / What Didn't Work
   ↳ Update task status from TODO/IN_PROGRESS to DONE ✅
   ↳ Update progress dashboard (Overall Status section)

STEP 2 (REQUIRED): Update update_todo_list tool
   ↳ Call update_todo_list function
   ↳ Change [ ] to [x] for completed task
   ↳ Add brief note: (file, time, result)
   ↳ Keep other tasks as [ ]

STEP 3 (REQUIRED): Ask user if they want to continue
   ↳ "✅ TASK X.Y complete. Continue to TASK X.Z? (yes/no)"
   ↳ Wait for user response
   ↳ If user says "yes" → Loop back to next task (DO NOT use attempt_completion)
   ↳ If user says "no" → Proceed to Step 4

STEP 4 (ONLY IF USER SAID STOP): Use attempt_completion
   ↳ Summarize what you did in this session
   ↳ Reference that details are in SYSTEMATIC_FIX_PLAN.md
```

**IF YOU USE attempt_completion BEFORE STEPS 1, 2 & 3 → YOU VIOLATED THE PROTOCOL**

**Memory Aid**: "Plan FIRST, Todo SECOND, Ask THIRD, Complete LAST (only if stopping)"

**VIOLATION EXAMPLE** (DO NOT DO THIS):
```
❌ WRONG:
1. Do the work
2. Use attempt_completion
3. Never update task list

This leaves no record of what you did!
```

**CORRECT EXAMPLE**:
```
✅ RIGHT:
1. Update task to IN_PROGRESS
2. Edit useMarkets.ts line 1
3. Update task to TESTING  
4. Run npm run type-check
5. Update task to DONE + add notes
6. Update update_todo_list tool
7. Use attempt_completion
```

---

## RULE 2: STATUS TRANSITIONS (IMMUTABLE)

**Valid Status Flow**:
```
TODO → IN_PROGRESS → TESTING → DONE ✅
  ↓         ↓           ↓
BLOCKED   FAILED      FAILED ❌
```

**YOU MUST**:
- Update status when entering each phase
- Never skip a status (can't go TODO → DONE directly)
- Document reason if task becomes BLOCKED or FAILED

**Status Meanings**:

| Status | When to Use | Required Action |
|--------|-------------|-----------------|
| `TODO` | Task is ready to start | Read task details |
| `IN_PROGRESS` | You are working on it NOW | Update both todo list and plan file |
| `TESTING` | Code done, running validation | Execute validation checklist |
| `BLOCKED` | Can't proceed | Document blocker, move to next task |
| `FAILED` | Tried but didn't work | Document what failed and why |
| `DONE` | Complete and validated | Add completion notes, update todo list |

---

## RULE 3: COMPLETION NOTES (MANDATORY)

**When you mark a task `DONE`, you MUST fill in ALL of these**:

```markdown
### TASK X.Y: [Task Name] - ✅ COMPLETED

**Completion Date**: YYYY-MM-DD HH:MM
**Time Taken**: X minutes (actual time you spent)
**Status**: DONE ✅

**Files Modified**:
- exact/path/to/file.ts (lines changed, what changed)
- another/path/file.tsx (brief description of change)

**Short Summary** (2-3 sentences max):
What you did and why it fixes the problem.

**Validation Results**:
- [x] Test 1: Description - PASSED
- [x] Test 2: Description - PASSED
- [ ] Test 3: Description - FAILED (created TASK X.Z to fix)

**What Worked**:
- Specific implementation detail that worked

**What Didn't Work** (if applicable):
- Thing you tried first that failed
- Why it didn't work
- How you solved it differently

**Issues Discovered During This Task**:
- New issue 1 (created TASK X.Y.a as subtask)
- New issue 2 (will address in Phase Z)

**Impact**:
- Performance: Response time 550ms → 80ms
- Code: Removed 43 lines of duplicate code
- User Experience: Page loads 3x faster

**Next Agent Should Know**:
Any important context for the next person.
```

**🚨 VALIDATION: Before marking task DONE, check for placeholders**:
```
Search completion notes for these strings:
- "_not started_"
- "_not completed_"
- "___" (blank fields)
- Empty fields

If ANY found → Task is NOT complete! Fill them in first.
```

**INCOMPLETE EXAMPLE** (DO NOT DO THIS):
```markdown
❌ BAD:
**Completion Date**: _not completed_
**Status**: DONE
**Files Modified**:
**Summary**:

This is marking DONE but notes are EMPTY!
```

**This is NOT ACCEPTABLE.** You must provide full details.

---

## RULE 4: FILE CHANGE TRACKING (MANDATORY)

**Format for Recording File Changes**:

```markdown
**Files Modified**:

1. `src/features/markets/hooks/useMarkets.ts`
   - **Line 1**: Changed `rontimport` to `import`
   - **Reason**: TypeScript syntax error
   - **Impact**: Fixes compilation, allows build to succeed
   - **Risk**: None (was broken before)

2. `src/components/SubHeader.tsx`
   - **Line 11**: Changed `trackedMarkets` to `trackedMarketIds`
   - **Lines 21, 57**: Updated `.length` references
   - **Reason**: Reduce API calls
   - **Impact**: 90% reduction in /my/markets requests
   - **Risk**: Low (same data, different format)
```

**What to Include**:
- ✅ Exact file path
- ✅ Line numbers changed
- ✅ What changed (before → after)
- ✅ Why you changed it
- ✅ Impact of the change
- ✅ Risk level (none/low/medium/high)

---

## RULE 5: ADDING NEW TASKS

### When to Add a Subtask

**Add Subtask When**:
- Current task reveals it's actually 2+ tasks
- Discover related issue that must be fixed together
- Need to split work into smaller chunks

**Subtask Format**:
```markdown
## TASK 3.2: Consolidate API Clients

- [ ] `TODO` **TASK 3.2**: Main task description
  - [ ] `TODO` **TASK 3.2a**: Create lib/api.ts file
  - [ ] `TODO` **TASK 3.2b**: Update marketsApi.ts to use it
  - [ ] `TODO` **TASK 3.2c**: Update applicationsApi.ts
  - [ ] `TODO` **TASK 3.2d**: Update remaining 4 API files
  - [ ] `TODO` **TASK 3.2e**: Test all features still work
```

**Naming Convention**: Main task + letter suffix (a, b, c, d...)

### When to Add a New Top-Level Task

**Add New Task When**:
- Discover systemic issue not in original plan
- Uncover critical bug blocking progress
- User requests new work
- Dependency needs to be resolved first

**Where to Add It**:
```markdown
## TASK 1.5: Newly Discovered Critical Issue

**Task ID**: `BLOCK-005`
**Current Status**: `TODO` ⬜
**Priority**: P0 (if critical) or P1/P2/P3
**Created**: 2026-01-18 (date discovered)
**Created By**: Agent Session #2
**Reason Created**: Describe why this task was added
**Dependencies**: What must be done first
**Blocks**: What is blocked by this
```

**Insert Location**:
- P0 (critical) → Insert in PHASE 1
- P1 (high) → Insert in PHASE 2
- P2 (medium) → Insert in PHASE 3
- P3 (low) → Insert at end or create new phase

### Document Why You Added It

**Required Documentation**:
```markdown
**Why This Task Was Added**:
While working on TASK 3.2, discovered that marketsApi.ts has a second
duplicate HttpClient class on lines 400-450 that wasn't in the original
audit. This must be removed as part of consolidation work.

**Discovery Context**:
- Original Task: TASK 3.2 (Consolidate API clients)
- Working On: marketsApi.ts
- Found: Additional duplicate code
- Impact: +30 minutes to task estimate
```

---

## RULE 6: TODO LIST SYNC PROTOCOL

**YOU MUST KEEP TWO THINGS IN SYNC**:

1. **The `update_todo_list` tool** (VSCode sidebar reminders)
2. **The `SYSTEMATIC_FIX_PLAN.md` file** (detailed notes)

### How to Keep Them Synced

**When Starting a Task**:
```markdown
1. Update SYSTEMATIC_FIX_PLAN.md:
   Change: `**Current Status**: TODO ⬜`
   To: `**Current Status**: IN_PROGRESS 🟨`

2. Update update_todo_list tool:
   Change: `- [ ] TASK 1.1: Fix TypeScript...`
   To: `- [-] TASK 1.1: Fix TypeScript...`
```

**When Completing a Task**:
```markdown
1. Update SYSTEMATIC_FIX_PLAN.md:
   - Change status to DONE ✅
   - Fill in ALL completion notes
   - Add files modified list
   - Add short summary

2. Update update_todo_list tool:
   Change: `- [-] TASK 1.1: Fix TypeScript...`
   To: `- [x] TASK 1.1: Fix TypeScript... (useMarkets.ts:1, 2min, builds now)`
```

**Note Format in todo list**:
```markdown
- [x] TASK 1.1: Fix typo (Files: useMarkets.ts, Time: 2min, Result: App compiles)
```

---

## RULE 7: VALIDATION IS NOT OPTIONAL

**Before Marking Task DONE**:

```
CHECKLIST:
☐ All validation steps in task executed?
☐ All validation steps passed?
☐ Completion notes filled in?
☐ Files modified documented?
☐ Summary written?
☐ update_todo_list tool updated?
☐ SYSTEMATIC_FIX_PLAN.md updated?

If ANY checkbox is unchecked → Task is NOT done
```

**If Validation Fails**:
```markdown
**Status**: FAILED ❌
**Attempt Date**: 2026-01-18
**What Failed**: Specific validation step that failed
**Error Details**: Exact error message or issue
**Next Steps**: What needs to happen to fix this
**Created**: TASK X.Y (to address the failure)
```

---

## RULE 8: DEPENDENCY ENFORCEMENT

**Before Starting ANY Task**:

```python
# Pseudo-code you MUST follow:
def can_start_task(task):
    # Check 1: Is task status TODO or IN_PROGRESS?
    if task.status not in ['TODO', 'IN_PROGRESS']:
        return False
    
    # Check 2: Are dependencies met?
    for dependency in task.dependencies:
        if dependency.status != 'DONE':
            task.status = 'BLOCKED'
            task.blocked_by = dependency.id
            return False
    
    # Check 3: Is previous phase complete (if in later phase)?
    if task.phase > 1:
        previous_phase = get_phase(task.phase - 1)
        if not all(t.status == 'DONE' for t in previous_phase.tasks):
            task.status = 'BLOCKED'
            task.blocked_by = f'Phase {task.phase - 1} not complete'
            return False
    
    return True

# If can_start_task returns False → DO NOT START THE TASK
```

**Example**:
```markdown
TASK 1.2 depends on TASK 1.1

If TASK 1.1 status = TODO or IN_PROGRESS:
→ You CANNOT start TASK 1.2
→ Mark TASK 1.2 as BLOCKED
→ Document: "Blocked by: TASK 1.1 (TypeScript must compile first)"
```

---

## RULE 9: PREVENT SCOPE CREEP

**Limits on Plan Modifications**:

| Action | Allowed Per Session | Requires |
|--------|-------------------|----------|
| Mark task DONE | Unlimited | Completion notes |
| Add subtask | Max 3 | Justification |
| Add new task | Max 2 | Critical need documented |
| Reorder phases | 0 | User approval required |
| Delete tasks | 0 | User approval required |
| Skip tasks | 1 | Must document why |

**If You Need to Add >2 New Tasks**:
```markdown
STOP. Ask user:
"I've discovered X new issues while working on TASK Y.
This suggests we may need to reassess the plan.

Issues found:
1. Issue description
2. Issue description  
3. Issue description

Should I:
A) Add all as new tasks to current plan
B) Create a separate follow-up plan
C) Pause and reassess scope"
```

---

## RULE 10: COMMUNICATION PROTOCOL

### When You Start Your Session

**First Action**: Read current state
```markdown
1. Open SYSTEMATIC_FIX_PLAN.md
2. Go to "CURRENT PROJECT STATUS" section
3. Find "Next Task" 
4. Verify dependencies are met
5. Update status to IN_PROGRESS
6. Begin work
```

### When You Finish a Task

**Before attempt_completion, Update**:

```markdown
# In SYSTEMATIC_FIX_PLAN.md:

## TASK X.Y: [Name] - ✅ COMPLETED

**Completion Date**: 2026-01-18 18:30
**Time Taken**: 15 minutes
**Status**: DONE ✅

**Files Modified**:
- src/file1.ts (line 10: changed X to Y)
- src/file2.tsx (lines 20-25: added validation)

**Summary**:
Fixed TypeScript compilation error by correcting import statement.
Verified app now builds successfully.

**Validation Results**:
- [x] TypeScript compiles (0 errors)
- [x] Dev server starts
- [x] Can navigate to /markets

**Next Task**: TASK 1.2 (dependencies now met)
```

```markdown
# In update_todo_list tool:

- [x] TASK 1.1: Fix TypeScript error (useMarkets.ts:1, 2min, compiles ✓)
- [-] TASK 1.2: Stop SubHeader spam (IN PROGRESS)
```

**Then** use `attempt_completion`:
```
Completed TASK 1.1: Fixed TypeScript compilation error in useMarkets.ts.
Changed 'rontimport' to 'import' on line 1. Build now succeeds.
Next: Starting TASK 1.2 (SubHeader optimization).
```

### When You Discover New Work

**Immediate Actions**:
1. Pause current task
2. Document the discovery
3. Create new task entry
4. Decide: subtask or new task?
5. Update plan with new task
6. Resume current task

**Documentation Format**:
```markdown
## DISCOVERED DURING TASK 1.2

**Issue**: Found second duplicate HttpClient in marketsApi.ts (lines 400-450)
**Severity**: Medium
**Impact**: Adds 30min to consolidation work
**Action**: Created TASK 3.2b to address this
**Decision**: Continuing with current task, will handle in Phase 3
```

---

# 🔄 WORKFLOW EXAMPLES

## Example 1: Simple Task (Success)

### Step-by-Step Execution

**1. Read Plan** (2 minutes)
```markdown
Open SYSTEMATIC_FIX_PLAN.md
Find next TODO task: TASK 1.1
Read description, success criteria, steps
Check dependencies: None ✓
```

**2. Update Status to IN_PROGRESS** (30 seconds)
```markdown
Update in SYSTEMATIC_FIX_PLAN.md:
**Current Status**: IN_PROGRESS 🟨
**Started**: 2026-01-18 18:30

Update in update_todo_list:
- [-] TASK 1.1: Fix TypeScript compilation error...
```

**3. Do the Work** (2 minutes)
```markdown
Open src/features/markets/hooks/useMarkets.ts
Edit line 1: rontimport → import
Save file
```

**4. Update Status to TESTING** (30 seconds)
```markdown
Update in SYSTEMATIC_FIX_PLAN.md:
**Current Status**: TESTING 🟧
**Testing Started**: 2026-01-18 18:32
```

**5. Run Validation** (1 minute)
```bash
npm run type-check
# Result: 0 errors ✓

Check dev server terminal
# Result: "ready" ✓

Open browser: http://localhost:5173/markets
# Result: Page renders ✓
```

**6. Update Status to DONE + Notes** (3 minutes)
```markdown
Update in SYSTEMATIC_FIX_PLAN.md:

**Completion Date**: 2026-01-18 18:35
**Time Taken**: 5 minutes
**Status**: DONE ✅

**Files Modified**:
- src/features/markets/hooks/useMarkets.ts (line 1: rontimport→import)

**Summary**:
Fixed TypeScript syntax error preventing compilation. Changed 'rontimport'
to 'import' on line 1. App now builds successfully and market pages load.

**Validation Results**:
- [x] TypeScript compiles with 0 errors
- [x] Dev server starts without errors
- [x] Can navigate to /markets route
- [x] No console errors

**What Worked**:
Simple one-word fix resolved the entire compilation failure.

**Issues Discovered**:
None. Task completed as planned.

**Next Task**: TASK 1.2 (all dependencies now met)
```

**7. Update Todo List Tool** (30 seconds)
```markdown
Call update_todo_list with:
- [x] TASK 1.1: Fix TypeScript error (useMarkets.ts:1, 5min, builds ✓)
- [ ] TASK 1.2: Stop SubHeader API spam...
```

**8. Use attempt_completion** (30 seconds)
```markdown
Result: "Completed TASK 1.1: Fixed TypeScript compilation error by
correcting 'rontimport' to 'import' in useMarkets.ts line 1.
Build now succeeds with 0 errors. Ready for TASK 1.2."
```

**Total Time**: 9 minutes

---

## Example 2: Task with Failure and Recovery

### Step-by-Step Execution

**1-2. Read Plan and Start**: Same as Example 1

**3. First Attempt** (10 minutes)
```markdown
Try Approach A: Use Redis caching
Edit backend/src/controllers/marketsController.js
Add Redis calls
Test: Works but user said "no Redis"
Rollback changes
```

**4. Document Failure** (2 minutes)
```markdown
**Attempt Log**:

**Attempt 1** (FAILED ❌):
- Approach: Added Redis caching to controller
- Files Changed: backend/src/controllers/marketsController.js (lines 285-290)
- Result: Technical success but user requirement violation
- Why Failed: User explicitly said "we don't want Redis"
- Rollback: Reverted all changes
- Time Spent: 10 minutes
- Lesson: Check requirements before implementation
```

**5. Second Attempt** (15 minutes)
```markdown
Try Approach B: In-memory Map caching
Edit backend/src/middleware/auth.js
Add Map-based cache
Test: Works perfectly, no external deps
Success! ✓
```

**6. Update to DONE** (3 minutes)
```markdown
**Completion Date**: 2026-01-18 19:15
**Time Taken**: 25 minutes (10min failed + 15min success)
**Status**: DONE ✅

**Attempts**: 2 (first attempt failed, documented above)

**Files Modified**:
- backend/src/middleware/auth.js (lines 10-50: added Map cache)

**Summary**:
Removed Redis dependency and replaced with in-memory Map-based caching.
First attempt used Redis (failed requirement check), second attempt
used Map (succeeded).

**What Worked**:
In-memory Map with TTL using setTimeout for auto-cleanup.

**What Didn't Work**:
Redis caching (violated user requirement for no external dependencies).

**Lessons Learned**:
Always check user requirements before implementing. Simpler solution
often better for MVP.
```

**7-8. Update Todo List and Complete**: Same as Example 1

---

## Example 3: Task Gets Blocked

### Step-by-Step Execution

**1-2. Read Plan and Start**: Same as Example 1

**3. Discover Blocker** (5 minutes)
```markdown
While working on TASK 2.4 (remove mapping function):
- Try to delete mapBackendMarketToFrontend()
- Test: Frontend crashes
- Reason: Backend still returns MongoDB format
- Realization: TASK 2.1 (serializer) must be done first
```

**4. Mark as BLOCKED** (2 minutes)
```markdown
Update in SYSTEMATIC_FIX_PLAN.md:

**Current Status**: BLOCKED 🟥
**Blocked Date**: 2026-01-18 18:45
**Blocked By**: TASK 2.1 (backend serializer) must be completed first
**Blocked Reason**: 
Attempted to remove mapping function but backend still returns
_id instead of id. Need serializer to transform data first.

**Attempted Work**:
- Tried to delete mapBackendMarketToFrontend from marketsApi.ts
- Result: Frontend crashes when loading markets
- Error: "Cannot read property 'id' of undefined"
- Cause: Backend returns _id, frontend expects id

**Unblocking Requirements**:
1. Complete TASK 2.1 (create serializer)
2. Test backend returns id field
3. Then can safely remove mapping function

**Next Action**: Moving to TASK 3.1 (can work independently)
```

**5. Update Todo List** (30 seconds)
```markdown
Update update_todo_list:
- [ ] TASK 2.4: Remove mapping function (BLOCKED by TASK 2.1)
```

**6. Move to Next Available Task**
```markdown
Find next TODO task that's not blocked:
- TASK 3.1: Remove Redis (no dependencies) ✓
Start working on TASK 3.1 instead
```

---

# 🚨 ERROR PREVENTION CHECKLIST

**Before Changing ANYTHING, Ask Yourself**:

- [ ] Have I read the entire task description?
- [ ] Do I understand the success criteria?
- [ ] Have I checked all dependencies are met?
- [ ] Do I know how to validate the change?
- [ ] Do I have a rollback plan if it fails?
- [ ] Have I updated the task status to IN_PROGRESS?

**Before Marking Task DONE, Ask Yourself**:

- [ ] Did I run ALL validation steps?
- [ ] Did ALL validations PASS?
- [ ] Did I document files changed?
- [ ] Did I write a summary?
- [ ] Did I update update_todo_list tool?
- [ ] Did I note what worked and what didn't?
- [ ] Did I identify next task?

**If Any Answer is NO → Task is NOT DONE**

---

# 📊 PROGRESS TRACKING REQUIREMENTS

## Update These Sections After Each Task

### 1. Current Project Status (Top of Plan)
```markdown
**Last Status Update**: 2026-01-18 18:45 (update timestamp)
**Currently Active Task**: TASK 1.2 (update to current)
**Next Task**: TASK 1.3 (update to next)
**Overall Progress**: 2/20 tasks (10%) (update count)
```

### 2. Phase Progress
```markdown
## PHASE 1: CRITICAL BLOCKERS
**Progress**: 2/4 (50%) ← UPDATE THIS
**Status**: IN PROGRESS ← UPDATE THIS

- [x] DONE ✅ TASK 1.1
- [x] DONE ✅ TASK 1.2
- [-] IN_PROGRESS 🟨 TASK 1.3 ← CURRENT
- [ ] TODO ⬜ TASK 1.4
```

### 3. Progress Dashboard
```markdown
## Overall Status
- **Total Tasks**: 20
- **Completed**: 2 ← UPDATE
- **In Progress**: 1 ← UPDATE
- **Blocked**: 1 ← UPDATE
- **Failed**: 0 ← UPDATE
- **Remaining**: 17 ← UPDATE
```

### 4. Session Log
```markdown
## Session 2: Task Execution - 2026-01-18 18:30-19:00

**Tasks Completed**: 
- ✅ TASK 1.1: Fixed TypeScript error (5min)
- ✅ TASK 1.2: Optimized SubHeader (12min)

**Tasks Started But Not Finished**:
- 🟨 TASK 1.3: Backend optimization (in progress, 15min so far)

**Issues Encountered**:
- None so far

**Next Session Will**:
- Complete TASK 1.3
- Move to TASK 1.4
```

---

# 🎓 WHAT GOOD LOOKS LIKE

## Example: Perfectly Executed Task

```markdown
## TASK 1.1: Fix TypeScript Compilation Error - ✅ COMPLETED

**Task ID**: BLOCK-001
**Status**: DONE ✅
**Completion Date**: 2026-01-18 18:35
**Time Taken**: 5 minutes
**Completed By**: AI Agent Session #2

### Work Performed

**Files Modified**:
1. `src/features/markets/hooks/useMarkets.ts`
   - **Line 1**: Changed `rontimport { useState, useCallback }` to `import { useState, useCallback }`
   - **Change Type**: Typo correction
   - **Reason**: TypeScript syntax error preventing compilation
   - **Impact**: Fixes entire build process
   - **Risk**: None (code was broken before)

### Summary
Corrected a typo in the import statement that was preventing TypeScript
compilation. The word "rontimport" was changed to "import" on line 1 of
useMarkets.ts. This single-character change fixed the compilation error
and allowed the development server to build successfully.

### Validation Performed

**Pre-Change State**:
- TypeScript compilation: FAILING ❌
- Error: "Unexpected keyword or identifier"
- Dev server: Not building

**Post-Change State**:
- TypeScript compilation: PASSING ✅
- Build errors: 0
- Dev server: Running successfully

**Validation Checklist**:
- [x] `npm run type-check` returns 0 errors
- [x] Dev server restarts without errors
- [x] Can navigate to /markets route
- [x] No import-related console errors
- [x] Market page renders (even if data loading fails)

### What Worked
- Simple typo correction immediately fixed compilation
- No side effects or additional changes needed
- Validation passed on first attempt

### What Didn't Work
- N/A (no failed attempts)

### Issues Discovered
- None. Task completed exactly as specified.

### Impact Assessment
- **Build Health**: BROKEN → WORKING ✅
- **Developer Productivity**: Unblocked
- **User Impact**: App can now run
- **Technical Debt**: Reduced
- **Code Quality**: Improved

### Next Steps
**Next Task**: TASK 1.2 (Stop SubHeader API spam)
**Dependencies Met**: Yes (TASK 1.1 is now DONE)
**Can Start Immediately**: Yes

### Handoff Notes for Next Agent
The app now compiles successfully. You can proceed with TASK 1.2.
No special considerations or warnings. The fix was clean and simple.
```

**This is what every completed task should look like.**

---

# ❌ WHAT BAD LOOKS LIKE

## Example: Poorly Executed Task (Don't Do This)

```markdown
## TASK 1.1: Fix TypeScript Error

**Status**: DONE

Fixed it. Works now.

**Files Modified**:
- useMarkets.ts
```

**Problems with This**:
- ❌ No completion date
- ❌ No time tracking
- ❌ No file path
- ❌ No line numbers
- ❌ No summary of what was done
- ❌ No validation results
- ❌ No next task identified
- ❌ Useless to next agent

**Result**: Next agent has no idea what you did or if it actually worked.

---

# 🎯 DECISION FLOWCHART

```
START SESSION
    ↓
Read SYSTEMATIC_FIX_PLAN.md
    ↓
Find next TODO task
    ↓
Check dependencies met? → NO → Mark BLOCKED, find next task
    ↓ YES
Update status: TODO → IN_PROGRESS (both files)
    ↓
Perform the work (edit files)
    ↓
Update status: IN_PROGRESS → TESTING
    ↓
Run validation checklist
    ↓
All tests pass? → NO → Mark FAILED, document, create fix task
    ↓ YES
Update status: TESTING → DONE
    ↓
Fill in ALL completion notes in SYSTEMATIC_FIX_PLAN.md
    ↓
Update update_todo_list tool with [x] and summary
    ↓
Update progress dashboard + session log
    ↓
Ask user: "Continue to next task? (yes/no)"
    ↓
User says YES? ───┐
    ↓ NO          │
Use attempt_completion  │
    ↓              │
END SESSION       │
                  │
    ┌─────────────┘
    │ LOOP BACK (Don't end session!)
    ↓
Find next TODO task (repeat from top)
```

**THE LOOP IS KEY**: After asking to continue, if user says YES, jump back to "Find next TODO task" and keep working!

**IF YOU SKIP ANY STEP → YOU'VE DONE IT WRONG**

---

# 🔐 IMMUTABLE TRUTHS

**These facts never change**:

1. **You MUST update the todo list** before using attempt_completion
2. **You MUST document what you changed** with file paths and line numbers
3. **You MUST run validation** before marking task done
4. **You MUST write a summary** (2-3 sentences minimum)
5. **You CANNOT skip tasks** unless dependencies not met
6. **You CANNOT delete completed tasks** (they're the history)
7. **You MUST follow phase order** (1→2→3→4→5)
8. **You MUST respect blocking** (if blocked, skip to next task)

---

# 📞 ESCALATION PROTOCOL

## When to Stop and Ask for Help

**STOP WORKING and ask user if**:

- [ ] 3+ tasks in a row fail validation
- [ ] Same task fails 3+ times with different approaches
- [ ] You discover >5 new critical issues
- [ ] Estimated time for phase grows >50%
- [ ] You need to reorder phases
- [ ] You need to delete tasks
- [ ] Plan structure is fundamentally wrong
- [ ] User requirements conflict with plan

**Message Format**:
```markdown
⚠️ ESCALATION NEEDED

**Current Task**: TASK X.Y
**Issue**: Description of problem
**Attempts Made**: 3 different approaches, all failed
**Impact**: Cannot proceed with current plan

**Options**:
A) Reassess the entire plan
B) Skip this task and revisit later
C) User provides additional guidance

**Recommendation**: [Your suggestion]
```

---

## RULE 11: CONTINUATION LOGIC (CRITICAL - NEW)

**🚨 AFTER COMPLETING A TASK, YOU MUST ASK THE USER BEFORE ENDING**

**DO NOT use attempt_completion immediately after one task!**

**Required Behavior**:
```
After updating plan files and todo list:

Ask user: "✅ TASK X.Y complete. Continue to TASK X.Z? (yes/no)"

Wait for response:
  ├─ "yes" or "continue" → Start TASK X.Z immediately (DO NOT complete)
  ├─ "no" or "stop" → Use attempt_completion
  └─ No response → Ask again after 30 seconds
```

**Example**:
```
AI: "✅ Completed TASK 1.2: SubHeader optimized, API spam reduced 90%.
     
     Next task: TASK 1.3 (Optimize /my/markets backend query).
     
     Continue to TASK 1.3? (yes/no)"

USER: "yes"

AI: [Starts TASK 1.3 immediately, updates status to IN_PROGRESS, continues working]
```

**Goal**: One session should complete MULTIPLE tasks until user says stop or phase complete.

**Wrong Behavior to Avoid**:
```
❌ Complete TASK 1.2 → Immediately use attempt_completion

This wastes time by ending after each task!
```

---

# ✅ FINAL CHECKLIST BEFORE COMPLETING SESSION

**Before using attempt_completion, verify ALL are true**:

- [ ] Current task status updated in SYSTEMATIC_FIX_PLAN.md
- [ ] Current task status updated in update_todo_list tool
- [ ] Completion notes filled in (if task done)
- [ ] Files modified documented with line numbers
- [ ] Summary written (2-3 sentences minimum)
- [ ] Validation results documented
- [ ] What worked/didn't work documented
- [ ] Issues discovered documented
- [ ] New tasks created if needed
- [ ] Next task identified
- [ ] Progress dashboard updated
- [ ] Session log updated
- [ ] **ASKED USER if they want to continue** ← NEW!
- [ ] **USER SAID "STOP" or "NO"** ← NEW!

**If first 12 checkboxes YES but last 2 are NO**:
→ DO NOT use attempt_completion
→ User wants you to keep working!

**If ANY of first 12 checkboxes is unchecked**:
→ DO NOT use attempt_completion yet
→ Go back and complete the missing documentation

---

# 📚 QUICK REFERENCE

## Task Status Symbols
- ⬜ `TODO` - Ready to start
- 🟨 `IN_PROGRESS` - Currently working
- 🟧 `TESTING` - Validating
- 🟥 `BLOCKED` - Can't proceed
- ✅ `DONE` - Complete
- ❌ `FAILED` - Didn't work
- ⊘ `SKIPPED` - Intentionally not done

## Priority Levels
- **P0**: Critical blocker, do immediately
- **P1**: High priority, do this week
- **P2**: Medium priority, do this month
- **P3**: Low priority, nice to have

## Complexity Levels
- **Trivial**: <5 minutes, single file, no risk
- **Low**: 5-30 minutes, few files, low risk
- **Medium**: 30-60 minutes, multiple files, some risk
- **High**: 1-3 hours, many files, significant risk
- **Very High**: 3+ hours, architectural change, high risk

---

**This protocol is MANDATORY. Follow it exactly.**

---

**LAST UPDATED**: 2026-01-18  
**VERSION**: 1.0  
**APPLIES TO**: All AI agents (Code, Architect, Debug modes)  
**ENFORCEMENT**: Strict - violations will be rejected
