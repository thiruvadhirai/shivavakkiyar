---
id: 0031
title: "Fix task files to match reality — consolidate completed work"
status: done
impact: High
priority: 031
complexity: "1-2 hours"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: []
  informed: []
dependencies: []
blocked_by: []
related: [0027a, 0028b, 0028c, 0029a, 0030]
---

# Task 0031: Fix Task Files to Match Reality

**Objective**: Consolidate task file status to accurately reflect what's been completed and merged to main, then establish a pattern for future task status synchronization.

**Date Created**: 2026-06-05  
**Status**: Starting  

## Problem

Task files don't reflect actual completion because:
1. Feature workflow doesn't update task status to "done" when merging
2. Completed tasks show as "in_progress", "pending", or "open" even after merge to main
3. No validation that task status matches git history

## Solution

1. Audit git history to identify completed tasks
2. Update task files to mark truly completed work as "done"
3. Create task list showing remaining open work with corresponding branches
4. Document pattern for future task synchronization

## Completed Tasks to Update

| Task | Current Status | Actual Status | Action |
|------|---|---|---|
| 0027a | in_progress | ✅ COMPLETED (merged) | Mark as done |
| 0028b | completed | ✅ COMPLETED | Verify done |
| 0028c | pending | ✅ COMPLETED (merged) | Mark as done |
| 0029a | pending | ✅ COMPLETED (merged) | Mark as done |

## Remaining Open Tasks (No Corresponding Branch)

| Task | Status | Work Needed |
|------|--------|------------|
| 0012 | open | Add Critical LSP Support |
| 0013 | open | Add Optional LSP Support |
| 0021 | open | Build artifact reference map |
| 0028a | open | Validate NOAACalculator accuracy tests |
| 0030 | in_progress | Complete E2E tests and merge to main |
| 0029 | open | Temporal API migration (blocked by 0030) |

## Acceptance Criteria

- [ ] Task files for 0027a, 0028c, 0029a updated to "done"
- [ ] Task 0030 status evaluated and updated
- [ ] All tests pass (npm test + E2E tests)
- [ ] Final list of open tasks with branches documented
- [ ] This task (0031) marked as done and merged to main
