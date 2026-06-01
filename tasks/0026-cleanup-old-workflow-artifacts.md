---
id: 0026
title: Clean up old workflow artifacts (consolidate to task-based system)
status: open
impact: Cleanup
priority: 040
complexity: "10 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

Old workflow system created redundant documentation. New system uses task files as single source of truth.

**Old artifacts are now duplicates:**
- `features.json` → Tasks are feature inventory
- `file-impacts.md` → Covered by architecture.md + task descriptions
- `.claude/ITERATION_WORKFLOW.md` → Redundant with WORKFLOW.md
- `ITERATION_LOG.md` → Git log is the iteration history
- `KNOWN_ISSUES.md` → Open bug tasks in tasks/
- `WIDGET_BUG_FIXES.md` → Bug tasks documented in tasks/
- `BUGFIXES.md` → Bug tasks documented in tasks/
- `TESTING_CHECKLIST.md` → Obsolete snapshot
- `TESTING.md` → Redundant with DEVELOPMENT.md
- `TASK_0023_AUDIT.md` → Temp audit file, no longer needed

## Solution

Delete all 10 files. Keep only:
- `.claude/WORKFLOW.md` (development workflow - canonical)
- `.claude/DEVELOPMENT.md` (setup/procedures)
- `.claude/architecture.md` (structure + relationships)
- `tasks/` directory (single source of truth)

## Acceptance Criteria

- [ ] All 10 files deleted
- [ ] Git history preserved (commit documents deletions)
- [ ] Task files remain (all work tracked in tasks/)
- [ ] No broken references remain
- [ ] Clean root directory

## Files to Delete

1. `features.json`
2. `file-impacts.md`
3. `.claude/ITERATION_WORKFLOW.md`
4. `ITERATION_LOG.md`
5. `KNOWN_ISSUES.md`
6. `WIDGET_BUG_FIXES.md`
7. `TESTING_CHECKLIST.md`
8. `TESTING.md`
9. `BUGFIXES.md`
10. `TASK_0023_AUDIT.md`

## Definition of Done

✅ All 10 files removed from repository
✅ No references to deleted files in remaining docs
✅ Tests still passing
✅ Committed with task ID reference
