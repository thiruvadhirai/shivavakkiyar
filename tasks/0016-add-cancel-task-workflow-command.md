---
id: 0016
title: Add cancel task workflow command
status: done
impact: High
priority: 040
complexity: "1-2 hours"
assignee: Claude
created: 2026-05-30
completed: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: [0015]
blocked_by: []
related: []
---

# Description

Cancelling a task currently requires multiple manual steps:
1. Create feature/requirement branch
2. Edit task file to change status to cancelled
3. Commit with task ID reference
4. Merge back to main

Users need a single command: `python3 scripts/feature-workflow.py cancel <task-id>` that automates the entire workflow.

# Location / Context

- `scripts/feature-workflow.py` — Add new `cancel` subcommand
- Task files in `tasks/NNNN-*.md` — Will be updated by the command

# Acceptance Criteria

## Scenario: Cancel task with single command
- **Given** a task exists with `status: open` or `in-progress`
- **When** user runs `python3 scripts/feature-workflow.py cancel 0014`
- **Then** task 0014 is marked `status: cancelled`, committed, and merged to main in one operation

## Scenario: Task status is updated correctly
- **Given** task 0014 has `status: open`
- **When** cancel command completes
- **Then** task file shows `status: cancelled` with no `completed` date

## Scenario: Commit references task ID
- **Given** user runs `python3 scripts/feature-workflow.py cancel 0014`
- **When** commit is created
- **Then** commit message includes `Fixes #0014`

## Scenario: Proper branch workflow
- **Given** user runs cancel command
- **When** the operation completes
- **Then** a requirement/cancel-XXXX branch was created and deleted; main is updated

# Test Plan

1. Test cancel on task 0014: `python3 scripts/feature-workflow.py cancel 0014`
2. Verify git log shows: `Task: Cancel task 0014`
3. Verify task 0014 status is `cancelled` in main branch
4. Verify requirement branch was cleaned up
5. Test error handling: try to cancel non-existent task
6. Test error: try to cancel already cancelled task

# Dependencies

- Task 0015 (cancelled status must exist first) ✅ Done

# Estimated Time

1-2 hours

# Notes

- Command should handle both `cancel 0014` (with leading zeros) and `cancel 14`
- Should validate task file exists before attempting cancel
- Error message if task already cancelled or done
- Auto-commit with standard message: "Task: Cancel task XXXX\n\nFixes #XXXX"
- Should create requirement/cancel-XXXX branch (not feature/)
- Should handle optional reason flag: `cancel 0014 --reason "No longer needed"`
