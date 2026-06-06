# Task 0044: Project-Workflow-Plugin - Marketplace-Ready Redesign

**Status:** Ready  
**Priority:** HIGH  
**Complexity:** EPIC (25+ sub-tasks across 5 phases + publishing)  
**Type:** Feature (New Product)  
**Distribution:** Marketplace-publishable, Reusable, Open-Source

---

## Overview

Build a standalone, marketplace-ready development workflow plugin that enforces best practices in ANY project. Provides:
- Unified CLI (`pw`/`pwX` shortcuts: pws, pwt, pwc, pwf, pwp, pwr, etc.)
- Permission gates before dangerous operations (commit/merge/push)
- "Before edit" validation (task must exist before feature branch)
- Sub-task detection & auto-execution (FEA:/BUG: in prompts)
- Planning workflow (./claudeplan/ temporary plans folder)
- 100% test coverage enforcement
- Pre-submission hook enforcement (blocks prompts if workflow violated)
- Zero memory-dependence (all rules embedded in plugin)
- **Portable & reusable** (works in any project via config)

---

## Context & Strategy

**Current State (Shivavakkiyar Project):**
- Workflow scattered across feature-workflow.py, .claude/hooks/, .claude/rules/, CLAUDE.md
- No permission gates or confirmation prompts
- No pre-edit validation
- Planning/sub-task detection exists but not integrated
- Each session requires memory/context to enforce rules

**Desired State (Standalone Plugin):**
- Build as SEPARATE, independent repo (`project-workflow-plugin`)
- Publishable to Claude Code marketplace
- Installable in any project (via git, PyPI, marketplace)
- Self-contained (no dependencies on shivavakkiyar)
- Configurable for different project structures
- Reference implementation: shivavakkiyar (installs as git submodule)

**Distribution Models:**
1. **PyPI** — `pip install project-workflow-plugin`
2. **Git Submodule** — `git submodule add .../project-workflow-plugin.git .claude/plugins/`
3. **Claude Code Marketplace** — Install directly from Claude UI
4. **Manual Install** — Copy folder to `.claude/plugins/`

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

### Phase 1: Foundation Complete ✅
- [ ] `pw --help` shows full help text
- [ ] `pw --version` shows version 1.0.0
- [ ] `pw h [command]` shows command-specific help
- [ ] `pw st` shows status (branch, version)
- [ ] `pw check-setup` validates environment (portable, PROJECT_ROOT aware)
- [ ] All shortcuts work (pws, pwt, pwc, pwf, pwp, pwr, pwst, pwl, pwh, pwcan, pwplan)
- [ ] 10+ tests passing for Phase 1
- [ ] Plugin installable in different repo (test portability)

### Phase 2: Core Workflow Complete ✅
- [ ] `pws NNNN-name` creates feature branch + validates task exists
- [ ] `pwt [-c]` runs tests in container + shows coverage (configurable container)
- [ ] `pwc "message"` commits with permission gate + validates tests/coverage
- [ ] `pwf` merges to main with permission gate
- [ ] `pwp` pushes to GitHub with permission gate
- [ ] Permission gates show y/n confirmation before dangerous ops
- [ ] All 5 core commands work with configurable container names
- [ ] All 5 core commands have 100% test coverage

### Phase 3: Planning Complete ✅
- [ ] `pwr "name"` creates task file (no branch/code)
- [ ] `./claudeplan/` folder created and auto-.gitignored
- [ ] `pw plan NNNN` creates working plan in ./claudeplan/
- [ ] `pw plan ls` lists all plans
- [ ] `pw plan promote NNNN` converts ./claudeplan/0042-* → tasks/0042-*
- [ ] Planning workflow documented in README
- [ ] Works in projects with different task directory structures

### Phase 4: Enforcement Complete ✅
- [ ] Pre-submit hook detects FEA:/BUG: in prompts
- [ ] Sub-tasks auto-created from prompt analysis
- [ ] High-priority subs auto-executed
- [ ] Low-priority subs prompt user
- [ ] 100% coverage required before merge (enforced)
- [ ] Hooks work across different project configurations

### Phase 5: Polish & Testing Complete ✅
- [ ] 100+ tests passing (100% coverage of plugin itself)
- [ ] All commands have comprehensive help text
- [ ] Documentation complete (README, INSTALL, examples)
- [ ] Plugin tested with real workflow (dogfoods itself in shivavakkiyar)
- [ ] Portable across 2+ test projects

### Phase 6: Publishing Complete ✅
- [ ] setup.py / pyproject.toml with correct metadata
- [ ] INSTALL.md with installation methods (git, PyPI, marketplace)
- [ ] README.md with feature overview, quick start, examples
- [ ] LICENSE file (MIT or Apache 2.0)
- [ ] CONTRIBUTING.md for external developers
- [ ] GitHub Actions CI/CD pipeline (tests, linting, releases)
- [ ] Published to PyPI
- [ ] Listed on Claude Code marketplace
- [ ] Beta tested by 2+ external projects
- [ ] Release versioning (semantic versioning, git tags)

---

## Phase Breakdown & Sub-Tasks

### PHASE 1: Plugin Foundation (4 Tasks)
**Goal:** Core plugin structure, CLI entry point, basic commands  
**Outputs:** Portable, configurable CLI framework  

- **0044a**: Create plugin.yaml + directory structure (priority: CRITICAL)
- **0044b**: Implement pw CLI entry point + config loading (priority: CRITICAL)
- **0044c**: Implement basic commands (help, status, check-setup) (priority: HIGH)
- **0044d**: Create CLI shortcuts (pws, pwt, pwc, etc.) (priority: HIGH)

### PHASE 2: Core Workflow Commands (5 Tasks)
**Goal:** Implement main workflow commands with permission gates  
**Outputs:** Full feature-branch workflow automation  

- **0045**: Implement pws (start feature workflow) (priority: CRITICAL)
- **0046**: Implement pwt (test with coverage) (priority: CRITICAL)
- **0047**: Implement pwc (commit with permission gate) (priority: CRITICAL)
- **0048**: Implement pwf (finish & merge) (priority: HIGH)
- **0049**: Implement pwp (push to GitHub) (priority: HIGH)

### PHASE 3: Requirements & Planning (4 Tasks)
**Goal:** Planning workflow and requirement management  
**Outputs:** Integrated planning system with ./claudeplan/ folder  

- **0050**: Implement pwr (requirement task only) (priority: HIGH)
- **0051**: Create ./claudeplan/ manager + .gitignore (priority: HIGH)
- **0052**: Implement pw plan (working plan creation) (priority: MEDIUM)
- **0053**: Implement pw plan promote (convert to task) (priority: MEDIUM)

### PHASE 4: Enforcement & Intelligence (4 Tasks)
**Goal:** Pre-submit enforcement, sub-task detection, auto-execution  
**Outputs:** Intelligent hook system preventing workflow violations  

- **0054**: Enhance pre-submit hook (FEA:/BUG: detection) (priority: HIGH)
- **0055**: Implement sub-task auto-creation (priority: HIGH)
- **0056**: Implement auto-executor for high-priority subs (priority: MEDIUM)
- **0057**: Add 100% coverage enforcement (priority: MEDIUM)

### PHASE 5: Polish, Testing & Documentation (3 Tasks)
**Goal:** Comprehensive testing, docs, final validation  
**Outputs:** Production-ready, fully tested plugin  

- **0058**: Comprehensive test coverage (100%) (priority: CRITICAL)
- **0059**: Documentation & help system (priority: HIGH)
- **0060**: Environment validation & final integration testing (priority: HIGH)

### PHASE 6: Marketplace Publishing (4+ Tasks)
**Goal:** Package and publish to marketplace  
**Outputs:** Published plugin available via PyPI, GitHub, marketplace  

- **0061**: Add setup.py / pyproject.toml + package metadata (priority: HIGH)
- **0062**: Create INSTALL.md, README.md, marketplace metadata (priority: HIGH)
- **0063**: Setup GitHub Actions for CI/CD and auto-publishing (priority: MEDIUM)
- **0064**: Create CONTRIBUTING.md, LICENSE, and governance docs (priority: MEDIUM)
- **0065**: Beta testing in other projects (priority: MEDIUM)
- **0066**: Publish to PyPI and Claude Code marketplace (priority: HIGH)

---

## Total Task Count
- **Phase 1-5**: 20 core implementation tasks
- **Phase 6**: 6 publishing tasks
- **Total**: 26+ implementation tasks

---

## Portability Requirements (All Phases)

Every task must ensure the plugin works in ANY project:

- ✅ **No hardcoded paths** (use `PROJECT_ROOT`, configurable directories)
- ✅ **Configurable containers** (default: podman-compose, configurable in defaults.json)
- ✅ **Flexible branch patterns** (configurable: feature/*, requirement/*, etc.)
- ✅ **Agnostic test runner** (detects test framework, configurable)
- ✅ **Env variable support** (PROJECT_ROOT, PLUGIN_ROOT, etc.)
- ✅ **Works without changes** (sane defaults for most projects)

---

## Testing Strategy (All Phases)

### Unit Tests
- Run in container per task
- 100% coverage of plugin code
- Mock external dependencies (git, podman, file system)

### Integration Tests
- Test against real git state
- Test container interactions
- Test hook execution flow

### Reference Implementation Testing
- Test in shivavakkiyar project
- Verify hooks, permission gates, enforcement
- Test real feature-branch workflow

### Portability Testing (Phase 6)
- Install in 2-3 other test projects
- Verify each command works without modification
- Test with different project structures

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

## Architecture Decisions

### Repo Structure
- **Primary Repo**: `anthropics/project-workflow-plugin` (NEW - standalone)
  - Location: GitHub (new repository)
  - Contains: Plugin source code, tests, docs, marketplace metadata
  - Independent CI/CD, releases, versioning
  
- **Reference Repo**: `shivavakkiyar` (THIS - consumer)
  - Location: `.claude/plugins/project-workflow-plugin/` (git submodule or installed)
  - Tests plugin in real workflow
  - Documents usage/integration examples

### Installation & Distribution
1. **PyPI Package** — `pip install project-workflow-plugin`
2. **Git Submodule** — `git submodule add .../project-workflow-plugin.git .claude/plugins/`
3. **Marketplace** — Install from Claude Code marketplace UI
4. **Manual** — Copy folder to `.claude/plugins/`

### Configuration Strategy
- **Defaults**: `config/defaults.json` (sane defaults for most projects)
- **Env Vars**: `PROJECT_ROOT`, `PLUGIN_ROOT`, container names, etc.
- **Per-Project**: Users can override via `.claude/config.json` or env vars
- **No Magic**: Plugin should work with zero config (but be customizable)

### Portability Rules (Enforced in All Phases)
- ✅ No hardcoded paths (use PROJECT_ROOT env var + Path)
- ✅ Configurable container names (default: saivamcloud-test, but flexible)
- ✅ Flexible test directories (detect or configure)
- ✅ Agnostic branch patterns (regex-based, configurable)
- ✅ Works in any git repo (no project-specific assumptions)

---

## Development Workflow (For New Repo)

```bash
# In NEW project-workflow-plugin repo:
$ git checkout -b feature/wt-0045-implement-pws
$ # ... implement task 0045 ...
$ git commit -m "feat: Implement pws command"
$ git push

# In THIS (shivavakkiyar) repo:
$ git submodule update --remote  # pulls latest from plugin repo
$ git commit -m "chore: Update plugin-workflow-plugin submodule"
```

---

## Success Metrics

✅ **Functionality**
- All 20 core tasks complete (Phases 1-5)
- 100+ tests passing (100% plugin code coverage)
- All acceptance criteria met

✅ **Portability**
- Works unmodified in 2+ test projects
- Handles different project structures
- ENV vars properly respected

✅ **Publishing**
- Available on PyPI
- Listed on Claude Code marketplace
- GitHub Actions CI/CD working
- Release versioning in place

✅ **Reusability**
- Other developers can install and use
- Clear installation docs
- Example projects provided
- CONTRIBUTING guidelines clear

---

## Notes

- This task is intentionally EPIC-sized because it's a complete product
- Spans 26+ implementation tasks + publishing
- Each phase should be ~5-8 hours of work
- Phases 1-5 are implementation, Phase 6 is distribution
- Plugin self-tests to ensure quality
- Separate repo needed for marketplace publishing
- Reference implementation (shivavakkiyar) validates real-world usage

---

## References

- Design Document: `docs/superpowers/specs/2026-06-06-project-workflow-plugin-design.md`
- Implementation Plan: `docs/superpowers/plans/2026-06-06-project-workflow-plugin-implementation.md`
- NEW Repo Location: TBD (create separately)
- Installation Instructions: Will be in README.md (plugin repo)
