---
id: 0011
title: Add FEA:/BUG: Prompt Parsing and BDD Task Templates
status: done
impact: High
priority: 020
complexity: "3-4 hours"
assignee: Claude
created: 2026-05-30
raci:
  responsible: Claude
  accountable: Vairam
  consulted: []
  informed: []
linked_tasks: [0008, 0009]
blocked_by: []
related: []
---

# Description

Add a structured entry point for creating requirements: `FEA:` and `BUG:` prefixed prompts. When a user submits a prompt like "FEA: 1. Add dark mode 2. Add print stylesheet", the presubmit hook intercepts it and provides:

1. Parsed item list with auto-generated branch names
2. Relationship type options (standalone, sub-task, depends-on, blocks)
3. Exact commands to run
4. Worktree guidance for mid-feature sub-requirements

Additionally, requirement branches auto-generate task files with BDD-style (Given/When/Then) acceptance criteria templates, enforcing clarity and testability going forward.

# Location / Context

- `.claude/hooks/enforce-workflow.py` — UserPromptSubmit hook that detects FEA:/BUG: prefixes
- `scripts/feature-workflow.py` — requirement command extended with flags + `requirement list` subcommand
- `.claude/hooks/pre-commit-enforce.py` — allow commits on requirement/* branches
- `tasks/TASK_WORKFLOW.md` — documentation of FEA:/BUG: format and BDD criteria format
- `tasks/0010-...md` — delete (malformed task, will be recreated via FEA: post-launch)

# Acceptance Criteria

## Scenario: FEA: single item prompt intercepted
- **Given** a prompt starting with "FEA: Add dark mode"
- **When** the UserPromptSubmit hook processes it
- **Then** the hook denies with one branch suggestion and relationship options

## Scenario: FEA: numbered list parsed into independent tasks
- **Given** a prompt "FEA: 1. Critical LSP 2. Optional Go/Rust support"
- **When** the hook processes it
- **Then** deny message lists both items with separate task IDs (0011, 0012) and branch names

## Scenario: FEA<n>: creates sub-tasks with --sub-of automatically
- **Given** a prompt "FEA0010: 1. Python LSP 2. JS LSP"
- **When** the hook processes it
- **Then** deny message shows both items with `--sub-of 0010` flag pre-filled

## Scenario: BUG: prefix produces bug- branch names
- **Given** a prompt "BUG: Calculator crashes at 180°"
- **When** the hook processes it
- **Then** branch suggestion uses `bug-` prefix (not `fea-`)

## Scenario: FEA: on feature/* branch shows worktree command
- **Given** current branch is feature/0011-something
- **When** a FEA: prompt is submitted
- **Then** deny message includes `git worktree add` and `git worktree remove` commands

## Scenario: requirement command with --sub-of creates parent_task
- **Given** user runs: `./scripts/feature-workflow.py requirement fea-0011-lsp --sub-of 0010`
- **When** cmd_requirement executes
- **Then** auto-created task file contains `parent_task: 0010` and `linked_tasks: [0010]`

## Scenario: requirement command with --depends-on creates blocked_by
- **Given** user runs: `./scripts/feature-workflow.py requirement fea-0011-lsp --depends-on 0009`
- **When** cmd_requirement executes
- **Then** auto-created task file contains `blocked_by: [0009]`

## Scenario: BDD template auto-generated in task file
- **Given** requirement command is run with NNNN in the name (e.g., fea-0011-something)
- **When** the task file is created
- **Then** it contains `## Scenario:` blocks with `**Given**`, `**When**`, `**Then**` sections

## Scenario: requirement list displays dependency tree
- **Given** task files with parent_task and blocked_by relationships exist
- **When** user runs `./scripts/feature-workflow.py requirement list`
- **Then** output shows active requirement branches + indented tree with parent/child and blocking relationships

## Scenario: commits allowed on requirement/* branches
- **Given** user is on requirement/0011-something
- **When** git commit is attempted with a message containing task ID
- **Then** pre-commit hook allows it (does not block as it does for main)

## Scenario: normal task-ID prompts unaffected
- **Given** a prompt "#0011 implement the slug generator"
- **When** the UserPromptSubmit hook processes it
- **Then** it is allowed (FEA:/BUG: detection is skipped)

## Scenario: all 85 existing tests still pass
- **Given** all changes implemented
- **When** `./scripts/feature-workflow.py test` is run
- **Then** all 85 tests pass with no regressions

# Test Plan

1. **Test FEA: single item**: Submit `FEA: Add calendar export` → verify deny message with one branch suggestion
2. **Test FEA: numbered list**: Submit `FEA: 1. Dark mode 2. Print stylesheet` → verify two items with separate task IDs
3. **Test FEA<n>: sub-tasks**: Submit `FEA0010: 1. Item A 2. Item B` → verify both show `--sub-of 0010`
4. **Test BUG: prefix**: Submit `BUG: crashes at 180°` → verify `bug-` prefix in branch name
5. **Test FEA: on feature/* branch**: Switch to feature branch, submit FEA: → verify worktree command
6. **Test requirement flags**: Run `requirement fea-0011-test --sub-of 0010 --depends-on 0009` → verify task file fields
7. **Test BDD template**: Create requirement, verify task file has Given/When/Then blocks
8. **Test requirement list**: Create multiple tasks with relationships, run `requirement list` → verify tree output
9. **Test pre-commit on requirement/***: Make change on requirement branch, commit → verify NOT blocked
10. **Test normal workflow**: Submit `#0011 fix something` → verify normal path is not intercepted
11. **Run full test suite**: `./scripts/feature-workflow.py test` → verify 85 tests pass

# Dependencies

- Task #0008: Workflow enforcement hooks (UserPromptSubmit infrastructure exists)
- Task #0009: Requirement branch pattern (requirement/* infrastructure exists)

# Estimated Time

3-4 hours (implementation + verification)

# Notes

- Task 0010 (LSP) was created outside this workflow (no RACI, no BDD criteria). Delete it on this requirement branch; it will be recreated properly via `FEA:` once this feature ships.
- Format parsing: `FEA: 1. A 2. B` generates two independent tasks with sequential IDs; `FEA0010: 1. A 2. B` generates two tasks with `--sub-of 0010` pre-filled.
- The worktree command is provided in the deny message but NOT auto-executed — user controls when to create the worktree.
