# Task Workflow Guide — Planning, Prioritization, and RACI

All development work starts with a task definition. This ensures alignment, prevents scope creep, tracks ownership via RACI matrix, and maintains dynamic prioritization.

---

## Task Lifecycle

### Phase 1: Planning (Before Code)

1. **Create task file** in `tasks/` with unique ID
2. **Define RACI matrix**: who's Responsible, Accountable, Consulted, Informed?
3. **Define priority**: 3-digit code (001-999, lower = higher priority)
4. **Define impact & complexity**: Critical/High/Medium/Low, hours estimate
5. **Write acceptance criteria**: how do we know it's done?
6. **Identify dependencies**: what must be done first?
7. **Check for collisions**: run `scripts/recalc-priorities.sh --dry-run` before committing task

### Phase 2: Implementation (Coding)

1. **Create feature branch**: `feature/NNNN-short-title`
2. **Implement to acceptance criteria**: use TDD
3. **Update task status**: `status: in-progress`
4. **Track progress**: TodoWrite with checkboxes
5. **Run tests**: `podman exec saivamcloud-test npm test`
6. **Commit frequently**: `Fixes #NNNN` in commit messages

### Phase 3: Completion (Testing + Merge)

1. **All acceptance criteria met**: ✅ checkboxes done
2. **All tests passing**: `npm run test:e2e`
3. **Code review** (if team)
4. **Update task status**: `status: done`
5. **Merge to main**: `./scripts/feature-workflow.sh finish`
6. **Push to GitHub**: `./scripts/push-to-github.sh`

---

## FEA:/BUG: Quick Entry Format

When you have a new feature idea or bug to capture, use this structured prompt format to automatically trigger requirement branch creation:

```
FEA: <description or numbered list>
BUG: <description or numbered list>
```

### Examples

**Single item:**
```
FEA: Add dark mode toggle to the calculator widget
BUG: Calculator crashes when longitude is exactly 180 degrees
```

**Numbered list (creates multiple independent tasks):**
```
FEA: 1. Add dark mode 2. Add print stylesheet 3. Add accessibility contrast check
BUG: 1. Crashes at 180° longitude 2. Wrong tithi at midnight DST boundary
```

**Sub-tasks (all items belong to parent task):**
```
FEA0010: 1. Python LSP support 2. JavaScript LSP support
BUG0009: 1. Fix bug in main flow 2. Fix edge case
```

### How It Works

The `UserPromptSubmit` hook intercepts FEA:/BUG: prompts and:
1. Parses items into a numbered list
2. Generates branch name suggestions: `requirement/fea-0011-item-slug`
3. Provides relationship type options: new / sub-task / depends-on / blocks
4. Shows exact commands to run

You then run the suggested commands. Each requirement automatically generates a task file with BDD-style acceptance criteria.

**Note**: FEA:/BUG: prompts are intentionally blocked — they are a structured entry point, not a way to bypass task workflow. The hook's deny message tells you exactly what commands to run next.

---

## Task File Format

Create files as: `tasks/NNNN-kebab-case-title.md` (where NNNN is a sequential ID like 0001, 0002, etc.)

### Frontmatter (Required)

```yaml
---
id: 0001
title: Fix Widget Null-Check Crashes
status: open                                    # open | in-progress | on-hold | done
impact: Critical                                # Critical | High | Medium | Low
priority: 010                                   # 001-999 (001=highest, 999=lowest)
                                                # use 2-digit increments for manual interleaving
complexity: "1-2 hours"                         # estimate in hours
assignee: Claude                                # Claude | Vairam | team member
created: 2026-05-29
completed: (optional, date when done)
raci:                                           # RACI matrix
  responsible: Claude                           # who does the work?
  accountable: Vairam                           # who's ultimately accountable?
  consulted: []                                 # who provides input?
  informed: []                                  # who needs to know?
parent_task: (optional, parent task ID if this is a sub-requirement)
linked_tasks: []                                # task IDs this depends on
blocked_by: []                                  # task IDs blocking this one
related: []                                     # GitHub issues or external refs
---
```

### RACI Matrix (Required)

```yaml
raci:
  responsible: Claude                           # Does the work
  accountable: Vairam                           # Makes final decision, ensures quality
  consulted: [designer, pm]                    # Provides input/expertise (optional)
  informed: [team]                              # Needs to know status (optional)
```

**Rules:**
- **Responsible** (R): Can only be ONE person/entity (usually Claude or team member)
- **Accountable** (A): Can only be ONE person (final authority, approves)
- **Consulted** (C): List of people to ask before finalizing
- **Informed** (I): List of people to notify when done

### Body Sections

```markdown
# Description

What problem are we solving? Why is it important?

# Location / Context

Where in the codebase? What files? Link to docs/.

# Acceptance Criteria

**New tasks (0011 onward)** should use BDD Scenario format:

```markdown
## Scenario: [Scenario Name]
- **Given** [the initial context or precondition]
- **When** [the action or event occurs]
- **Then** [the expected observable outcome]

## Scenario: [Another Scenario]
- **Given** [another starting condition]
- **When** [action or event]
- **Then** [expected result]
```

**Why BDD?** Scenarios are testable and unambiguous. "Given/When/Then" forces you to specify preconditions, action, and result. Natural to convert into test cases.

**Legacy tasks** (0001-0010) use checkboxes—no need to convert:
```markdown
- [ ] Widget handles undefined panchanga gracefully
- [ ] No console errors when calculation fails
- [ ] E2E tests pass
- [ ] Error message displays to user
```

# Test Plan

How will we verify this works?

1. Run E2E tests: `npm run test:e2e`
2. Test with invalid coordinates
3. Check console for errors

# Dependencies

What must be done first?

- Task #0002 (setup infrastructure)
- External: waiting on Astronomy Engine update

# Estimated Time

1-2 hours (code + test + review)

# Notes

Any additional context or gotchas?
```

---

## Task File Naming & Priority Numbering

### File Naming

```
tasks/NNNN-kebab-case-title.md

Examples:
- tasks/0001-fix-widget-null-checks.md
- tasks/0002-setup-task-workflow.md
- tasks/0003-add-dark-mode-support.md
- tasks/0010-refactor-location-manager.md
```

**NNNN** is a zero-padded sequential ID for tracking order of creation.

### Priority Numbering (3-digit, 001-999)

Priority is **independent of ID**. Lower numbers = higher priority.

**Use 2-digit increments** to allow manual interleaving:

```
010 — Critical, do first
030 — High, do soon
050 — Medium, do eventually
070 — Low, do when time
090 — Nice to have

// Someone discovers a deviation task that's Critical:
005 — CRITICAL DEVIATION: system is broken

// After running `scripts/recalc-priorities.sh`:
// System re-numbers all to maintain 2-digit gaps:
005 — CRITICAL DEVIATION
015 — Critical, do first (was 010)
035 — High, do soon (was 030)
... etc
```

### Auto-Recalculation of Priorities

Run when:
1. **After creating a new task with higher priority than existing ones**
2. **When a task's priority needs to change** (e.g., deviation task is more urgent)
3. **Before committing** (optional pre-commit hook can check this)

```bash
# Dry run (show what would change):
./scripts/recalc-priorities.sh --dry-run

# Actually update all task files:
./scripts/recalc-priorities.sh

# Auto-update during planning (when exiting plan mode):
# Claude internally calls this
```

---

## Dependency Relationship Types

When creating a requirement, specify how it relates to existing tasks:

| Flag | Frontmatter field | Meaning |
|------|-------------------|---------|
| `--sub-of <id>` | `parent_task: <id>` | This is a sub-requirement of another task |
| `--depends-on <id>` | `blocked_by: [<id>]` | This cannot start until that task completes |
| `--blocks <id>` | (noted in body) | This task, when done, unblocks that task |

**Example**: Create sub-requirements of task 0010
```bash
./scripts/feature-workflow.py requirement fea-0011-python-lsp --sub-of 0010
./scripts/feature-workflow.py requirement fea-0012-js-lsp --sub-of 0010
```

**View dependency tree:**
```bash
./scripts/feature-workflow.py requirement list
```

**When on a feature/* branch** (mid-feature sub-requirement):
Use a worktree to isolate the sub-feature work:
```bash
# Create a new worktree for the sub-requirement
git worktree add ../shivavakkiyar-req requirement/fea-0013-sub-feature

# (Optional) Spawn a sub-agent to work on it
# [Feature planned for future: spawn-subagent CLI command]

# When done, remove the worktree
git worktree remove ../shivavakkiyar-req
```

---

## Status Values

| Status | Meaning | When to Use |
|--------|---------|------------|
| `open` | Not started | New task just created |
| `in-progress` | Being worked on | Someone is actively coding it |
| `on-hold` | Blocked or waiting | Waiting for something external (another task, info, approval) |
| `done` | Complete and merged | Code is in main, all tests pass |

---

## Impact & Priority

### Impact (How much does this matter?)

- **Critical**: System doesn't work without this (crashes, security, core feature)
- **High**: Significant user-facing improvement or important fix
- **Medium**: Nice to have, improves usability or code quality
- **Low**: Cosmetic or very minor improvement

### Priority (3-digit: 001 = highest, 999 = lowest)

Use RACI matrix output + impact to determine 3-digit priority:

```
CRITICAL + Responsible = 010 (do first)
HIGH + Responsible = 030 (do soon)
MEDIUM + Consulted = 050 (middle)
LOW + Informed = 070 (later)
```

### Example: RACI Matrix Driving Priority

```markdown
## Task 1: Fix widget crash (CRITICAL)

raci:
  responsible: Claude      # Does work immediately
  accountable: Vairam      # Vairam approves
  consulted: []
  informed: [team]

priority: 010              # CRITICAL + Responsible → do first
```

```markdown
## Task 2: Add dark mode (MEDIUM)

raci:
  responsible: [todo]      # Will assign later
  accountable: Vairam      # Vairam decides if it ships
  consulted: [designer]    # Designer helps with colors
  informed: [team]

priority: 050              # MEDIUM + needs consultation → middle
```

---

## Working on a Task

### Step 1: Update Status & RACI

```yaml
---
status: in-progress
raci:
  responsible: Claude
  accountable: Vairam
---
```

### Step 2: Create Feature Branch

Branch name uses **task ID** (NNNN), not priority (priority can change):

```bash
./scripts/feature-workflow.sh start 0001-fix-widget-null-checks
# Creates branch: feature/0001-fix-widget-null-checks
# Installs git hooks automatically
```

### Step 3: Use TodoWrite to Track Progress

```
TodoWrite:
- [ ] Write failing test
- [ ] Implement null-check guards
- [ ] Run integration tests
- [ ] Run E2E tests: npm run test:e2e
- [ ] Commit via feature-workflow.sh
- [ ] Merge to main
```

### Step 4: Commit with Task Reference

Commit message references **task ID**, not priority:

```bash
./scripts/feature-workflow.sh commit "Fix widget null-check crashes

- Add optional chaining to panchanga result access
- Handle undefined location gracefully
- Add error message for calculation failure
- All tests passing

Fixes #0001"
```

Version auto-increments via pre-commit hook.

### Step 5: Mark Task Done & Update Accountable

```yaml
---
status: done
completed: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam     # Vairam approved/reviewed
---
```

---

## Deviation Tasks (Priority Escalation)

### What's a Deviation?

A deviation task is one that wasn't planned but emerges during development (e.g., you discover a security bug while implementing a feature).

### How to Handle

1. **Create new task file** with next sequential ID
2. **Mark `priority` based on impact** (likely higher than current work)
3. **Run `./scripts/recalc-priorities.sh`** to re-number all tasks
4. **Update RACI matrix**: who's responsible for this deviation?
5. **Continue current work OR switch** to deviation (based on priority)

### Example

Current task priorities:
```
010 — Fix widget null-checks (in-progress)
030 — Setup task workflow
050 — Add dark mode
```

During work on task #0001, you discover a security vulnerability in location manager:

```markdown
---
id: 0004
title: SECURITY: Location manager SQL injection risk
status: open
impact: Critical
priority: 005              # Estimate: higher than 010
raci:
  responsible: Claude
  accountable: Vairam      # Security is Vairam's call
---
```

Run priority recalc:

```bash
./scripts/recalc-priorities.sh

# Output:
# 005 — SECURITY: Location manager SQL injection risk (NEW DEVIATION)
# 015 — Fix widget null-checks (was 010)
# 035 — Setup task workflow (was 030)
# 055 — Add dark mode (was 050)
```

Now you decide: finish current task (010/015) or switch to deviation (005)?

---

## Task Index (Auto-Generated)

Maintain a running sorted list by priority. This can be auto-generated by a script:

```bash
./scripts/list-tasks.sh --by-priority
```

Output:
```markdown
# Tasks (Sorted by Priority)

| Priority | ID | Title | Status | Impact | Assignee |
|----------|----|----|--------|--------|----------|
| 005 | 0004 | SECURITY: Location SQL injection | open | Critical | Claude |
| 015 | 0001 | Fix widget null-checks | in-progress | Critical | Claude |
| 035 | 0002 | Setup task workflow | open | High | Claude |
| 055 | 0003 | Add dark mode | open | Medium | — |
```

---

## Scripts for Task Management

### `scripts/recalc-priorities.sh`

Reads all task files, checks for collisions, auto-updates priorities with 2-digit increments.

```bash
# Dry run (preview changes):
./scripts/recalc-priorities.sh --dry-run

# Actually update files:
./scripts/recalc-priorities.sh

# Auto-run before commit (optional pre-commit hook):
# if [ -f scripts/recalc-priorities.sh ]; then
#   ./scripts/recalc-priorities.sh || exit 1
# fi
```

### `scripts/list-tasks.sh`

List all tasks in various formats.

```bash
# By priority (high to low):
./scripts/list-tasks.sh --by-priority

# By status:
./scripts/list-tasks.sh --by-status

# By RACI responsibility:
./scripts/list-tasks.sh --by-raci

# Just open tasks:
./scripts/list-tasks.sh --open

# Markdown table:
./scripts/list-tasks.sh --markdown > TASK_INDEX.md
```

---

## Tips for Success

1. **Plan before coding** — take 15 min to write the task file with RACI
2. **RACI clarity** — one Responsible, one Accountable (no ambiguity)
3. **Be specific with acceptance criteria** — "works correctly" is vague; "widget shows 'N/A' when panchanga is undefined" is clear
4. **Break big tasks into smaller ones** — if >4 hours, split it
5. **Use 2-digit priority increments** — makes manual interleaving easy
6. **Run priority recalc when needed** — don't manually edit priorities (use the script)
7. **Link related tasks** — use `linked_tasks` and `blocked_by` fields
8. **Reference task ID in commits** — `Fixes #0001` links commits to the task
9. **Update status regularly** — keep task file in sync with reality
10. **Archive closed tasks** — once done, task file stays in git for history

---

## Example: Complete Task File with RACI

```markdown
---
id: 0001
title: Fix Widget Null-Check Crashes
status: in-progress
impact: Critical
priority: 015
complexity: "1-2 hours"
assignee: Claude
created: 2026-05-29
completed: (pending)
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: [team]
linked_tasks: []
blocked_by: []
related: [gh-issue-47]
---

# Description

The panchanga calculator widgets crash when the Astronomy Engine returns an undefined result or the user's location data is incomplete. This happens in edge cases (poles, date line, network latency).

Example error:
```
TypeError: Cannot read properties of undefined (reading 'toUpperCase')
at panchanga-widget-full.html:311
```

Impact: Breaks widget entirely for certain users, production issue.

# Location

- `_includes/panchanga-widget-full.html` line 311
- `_includes/panchanga-widget-simple.html` line 344

Both use: `p.tithi.phase.toUpperCase()` without null check

See: [docs/widget-spec.md](../docs/widget-spec.md#null-safety-contract)

# Acceptance Criteria

- [x] Add optional chaining (`?.`) to all panchanga result access in both widgets
- [x] Graceful error message when calculation fails
- [x] No console errors in E2E tests
- [x] Widget displays "N/A" instead of crashing for undefined values
- [x] All E2E tests pass (15+ browser tests)

# Test Plan

1. Run E2E tests: `podman exec saivamcloud-test npm run test:e2e`
2. Test with invalid coordinates (poles: 90°N, date line: 180°)
3. Manual test: open widget, enter "North Pole" as location
4. Verify: error message appears, no console errors

# Implementation Notes

Used optional chaining pattern throughout both widgets:

**Before (crashes):**
```javascript
p.tithi.phase.toUpperCase()
selectedLocation.latitude
```

**After (safe):**
```javascript
p?.tithi?.phase?.toUpperCase?.() ?? 'N/A'
selectedLocation?.latitude ?? 0
```

Updated both widget files: panchanga-widget-full.html and panchanga-widget-simple.html

# Dependencies

None — this is a standalone bug fix.

# Time Tracking

- Planning: 10 min
- Writing tests: 15 min
- Implementation: 25 min
- E2E testing: 15 min
- Commit + review: 10 min
- **Total: 1.25 hours**

---

## Related Files

- [docs/widget-spec.md](../docs/widget-spec.md) — widget null-safety contract
- [tests/e2e.spec.js](../tests/e2e.spec.js) — browser tests
- [tests/widget-issues.test.js](../tests/widget-issues.test.js) — regression tests
```

---

## Notes

- Task files are committed to git — they're part of project history
- Task IDs never change (immutable), but priorities can be re-calculated
- If a task becomes obsolete, mark it `done` with a note in the completed date, don't delete it
- RACI matrix makes accountability clear (no "someone should do this")
- Deviation tasks allow flexible prioritization without disrupting task IDs
