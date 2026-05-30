---
id: 0015
title: Add cancelled status to task workflow
status: done
impact: Medium
priority: 050
complexity: "less than 1 hour"
assignee: Claude
created: 2026-05-30
completed: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: []
blocked_by: []
related: []
---

# Description

The task workflow currently has four status values: `open`, `in-progress`, `on-hold`, and `done`. This conflates two different outcomes:
- **`done`** — task was completed and implemented successfully
- **`cancelled`** — task was planned but never implemented (descoped, requirement changed, no longer needed, etc.)

Adding `cancelled` status makes the task history clearer and semantically distinguishes between "never built" vs. "successfully completed."

# Location / Context

- `tasks/TASK_WORKFLOW.md` — Documents valid status values and task lifecycle (line 289-294, 650)
- Task files throughout `tasks/` directory use the status field in frontmatter

# Acceptance Criteria

## Scenario: Cancelled status is documented as valid
- **Given** TASK_WORKFLOW.md defines all valid status values
- **When** a developer reads the Status Values section
- **Then** `cancelled` is listed with `open`, `in-progress`, `on-hold`, `done` with clear definition

## Scenario: Guidance distinguishes cancelled from done
- **Given** TASK_WORKFLOW.md provides lifecycle and notes guidance
- **When** a task becomes descoped or is no longer needed
- **Then** documentation directs to use `cancelled` (never implemented) not `done` (completed successfully)

# Test Plan

1. Update Status Values table in TASK_WORKFLOW.md (line 289-294)
2. Update Notes section (line 650) to distinguish cancelled vs. done with example
3. Run `./scripts/feature-workflow.py requirement list` to verify syntax
4. Verify documentation is clear and internally consistent
5. Commit changes: `./scripts/feature-workflow.py commit "..."`

# Dependencies

None — purely documentation.

# Estimated Time

Less than 1 hour

# Notes

- Non-breaking change: existing tasks and workflow unaffected
- Improves historical record-keeping clarity
- Semantic distinction: `cancelled` (never implemented) vs. `done` (completed successfully)
- Different from `obsolete` (a feature built and now removed/deprecated)
