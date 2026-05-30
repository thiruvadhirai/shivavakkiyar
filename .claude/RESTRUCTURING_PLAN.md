# Plan: Restructure .claude/ to Claude Code Native Format + Task Workflow

**Approved Plan** | Implementation: 2026-05-29

## Context

Restructured `.claude/` directory to use Claude Code's native architecture instead of custom markdown files that bloat context by loading everything on every task.

**Goals Achieved:**
- ✅ Minimal context window via path-scoped rules
- ✅ Project specs visible to all devs (docs/)
- ✅ Version increment in source control (scripts/hooks/)
- ✅ Container-only test enforcement (permissions)
- ✅ Task workflow system with RACI matrix
- ✅ Sub-agent isolation ready (skills/)

---

## Implementation Status

### ✅ Completed

- [x] Task workflow system (`tasks/TASK_WORKFLOW.md`)
  - RACI matrix (Responsible, Accountable, Consulted, Informed)
  - 3-digit priority (P1-P5 Eisenhower Matrix)
  - Dynamic recalculation with 2-digit increments

- [x] `.claude/settings.json` — permissions + Stop hook

- [x] `.claude/rules/` — 5 path-scoped files
  - general.md, testing.md, widgets.md, calculator.md, git-workflow.md

- [x] `.claude/skills/` — 3 on-demand skills
  - feature-workflow, tdd, task-planning

- [x] Specifications (version-controlled)
  - docs/widget-spec.md, docs/calculator-spec.md

- [x] Git hooks (source-controlled)
  - scripts/hooks/pre-commit, scripts/bump-session.sh

- [x] Tests: 85/85 passing

### ⏸️ Deferred

- [ ] Trim CLAUDE.md
- [ ] Archive legacy .claude/ files
- [ ] Update .gitignore, _config.yml

---

## Key Features

**Token Efficiency**: Rules load on-demand per file type

**Task-Driven**: Every feature starts with task file (impact/priority/RACI/criteria)

**Linear History**: Hierarchical branches → linear on main

**Container-Only Testing**: Enforced by permissions + pre-commit

**Visible Specs**: docs/ version-controlled

---

## Commits

```
542a33a330f — Add: Task workflow system with RACI matrix
8233ee93b70 — Add: Claude Code native structure with rules and skills
```

---

## Status

Testing phase: reorganization complete, workflow enforcement next iteration
