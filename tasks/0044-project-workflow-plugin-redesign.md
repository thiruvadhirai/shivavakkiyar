# Task 0044: Project-Workflow-Plugin Redesign

**Status:** Ready  
**Priority:** HIGH  
**Complexity:** EPIC (25 sub-tasks across 5 phases)  
**Type:** Feature  

---

## Overview

Convert scattered workflow rules/hooks/scripts into a unified, enforcement-driven plugin (`pw`/`pwX` CLI) with:
- Single-character shortcuts (pws, pwt, pwc, pwf, pwp, pwr, etc.)
- Permission gates before commit/merge/push
- "Before edit" validation (task must exist)
- Sub-task detection & auto-execution
- Planning workflow (./claudeplan/ folder)
- 100% test coverage enforcement
- Not memory-dependent (all rules embedded)

---

## Context

Current state:
- Workflow scattered across feature-workflow.py, .claude/hooks/, .claude/rules/, CLAUDE.md
- No permission gates or confirmation prompts
- No pre-edit validation
- Planning/sub-task detection exists but not integrated
- Each session requires memory/context to enforce rules

Desired state:
- Single `pw` command with full workflow enforcement
- Shortcuts like `pws 0042-name` for quick access
- Permission gates before dangerous operations
- Integrated planning (./claudeplan/)
- Plugin-based architecture (not just skills/rules)

---

## Implementation Plan

**Full plan:** `docs/superpowers/plans/2026-06-06-project-workflow-plugin-implementation.md`

### Phase 1: Plugin Foundation (Tasks 0044a-0044d)
- Create plugin.yaml + directory structure
- Implement pw CLI entry point
- Implement basic commands (help, status, check-setup)
- Create CLI shortcuts (pws, pwt, pwc, etc.)

### Phase 2: Core Workflow (Tasks 0045-0049)
- Implement `pws` (start feature workflow)
- Implement `pwt` (test with coverage)
- Implement `pwc` (commit with permission gate)
- Implement `pwf` (finish & merge)
- Implement `pwp` (push to GitHub)

### Phase 3: Requirements & Planning (Tasks 0050-0053)
- Implement `pwr` (requirement task only)
- Create ./claudeplan/ manager
- Implement `pw plan` (working plan creation)
- Implement `pw plan promote` (convert plan to task)

### Phase 4: Enforcement & Intelligence (Tasks 0054-0057)
- Enhance pre-submit hook (FEA:/BUG: detection)
- Implement sub-task auto-creation
- Implement auto-executor for high-priority subs
- Add 100% coverage enforcement

### Phase 5: Polish & Testing (Tasks 0058-0060)
- Comprehensive test coverage (100%)
- Documentation & help system
- Environment validation (check-setup)

---

## Acceptance Criteria

### Phase 1 Complete
- [ ] `pw --help` shows full help text
- [ ] `pw --version` shows version 1.0.0
- [ ] `pw h [command]` shows command-specific help
- [ ] `pw st` shows status (branch, version)
- [ ] `pw check-setup` validates environment
- [ ] All shortcuts work (pws, pwt, pwc, pwf, pwp, pwr, pwst, pwl, pwh, pwcan, pwplan)
- [ ] 10+ tests passing for Phase 1

### Phase 2 Complete
- [ ] `pws NNNN-name` creates feature branch + validates task exists
- [ ] `pwt [-c]` runs tests in container + shows coverage
- [ ] `pwc "message"` commits with permission gate + validates tests/coverage
- [ ] `pwf` merges to main with permission gate
- [ ] `pwp` pushes to GitHub with permission gate
- [ ] Permission gates show y/n confirmation before dangerous ops
- [ ] All 5 core commands have 100% test coverage

### Phase 3 Complete
- [ ] `pwr "name"` creates task file (no branch/code)
- [ ] `./claudeplan/` folder created and .gitignored
- [ ] `pw plan NNNN` creates working plan in ./claudeplan/
- [ ] `pw plan ls` lists all plans
- [ ] `pw plan promote NNNN` converts ./claudeplan/0042-* → tasks/0042-*
- [ ] Planning workflow documented

### Phase 4 Complete
- [ ] Pre-submit hook detects FEA:/BUG: in prompts
- [ ] Sub-tasks auto-created from prompt analysis
- [ ] High-priority subs auto-executed
- [ ] Low-priority subs prompt user
- [ ] 100% coverage required before merge (enforced)

### Phase 5 Complete
- [ ] All 25 tasks completed
- [ ] 100+ tests passing (100% coverage of plugin itself)
- [ ] All commands have help text
- [ ] Documentation complete
- [ ] Plugin tested with real workflow (dogfoods itself)

---

## Sub-Tasks

1. **0044a**: Create plugin.yaml + directory structure
2. **0044b**: Implement pw CLI entry point + config loading
3. **0044c**: Implement basic commands (help, status, check-setup)
4. **0044d**: Create CLI shortcuts (pws, pwt, pwc, etc.)

5. **0045**: Implement pws (start feature workflow)
6. **0046**: Implement pwt (test with coverage)
7. **0047**: Implement pwc (commit with permission gate)
8. **0048**: Implement pwf (finish & merge)
9. **0049**: Implement pwp (push to GitHub)

10. **0050**: Implement pwr (requirement task only)
11. **0051**: Create ./claudeplan/ manager
12. **0052**: Implement pw plan (working plan)
13. **0053**: Implement pw plan promote

14. **0054**: Enhance pre-submit hook (FEA:/BUG: detection)
15. **0055**: Implement sub-task auto-creation
16. **0056**: Implement auto-executor for high-priority
17. **0057**: Add 100% coverage enforcement

18. **0058**: Write comprehensive tests (100% coverage)
19. **0059**: Write documentation & help
20. **0060**: Environment validation & final testing

---

## Testing Strategy

### Unit Tests (in container)
```bash
podman-compose run --rm saivamcloud-test pytest .claude/plugins/project-workflow-plugin/tests/
```

### Integration Tests (in container)
- Test `pw` commands against real git/podman state
- Test permission gates with mock input
- Test sub-task detection with sample prompts

### E2E Tests (real workflow)
- Create actual task → branch → commit → merge → push
- Verify plugin enforces all rules
- Verify hooks block violations

---

## Success Metrics

- ✅ All 100+ tests passing (in container)
- ✅ 100% code coverage of plugin code
- ✅ All 25 tasks completed
- ✅ Plugin used to implement itself (dogfooding)
- ✅ Developers can type `pws NNNN-name` and workflow runs
- ✅ Permission gates prevent mistakes
- ✅ No memory-dependent behavior

---

## RACI Matrix

| Role | Responsibility |
|------|-----------------|
| Claude (Haiku) | Write code, tests, docs |
| User | Review plans, approve designs, test manually |
| Plugin | Test itself (dogfooding) |

---

## Notes

- This task is intentionally EPIC-sized because it's a complete redesign
- Each phase should be ~5-8 hours of work
- Plugin self-tests to ensure quality
- Can be executed in parallel phases if needed (but sequential is safer)

---

## References

- Design Document: `docs/superpowers/specs/2026-06-06-project-workflow-plugin-design.md`
- Implementation Plan: `docs/superpowers/plans/2026-06-06-project-workflow-plugin-implementation.md`
- Related Rules: `.claude/rules/general.md`, `.claude/rules/git-workflow.md`
