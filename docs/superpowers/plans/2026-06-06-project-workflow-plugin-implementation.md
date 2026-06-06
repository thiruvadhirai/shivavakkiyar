# Project-Workflow-Plugin Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to execute this plan task-by-task. Each task has fresh subagent + two-stage review (spec compliance, then code quality).

**Goal:** Build a marketplace-publishable, reusable development workflow plugin that can be installed in any project. Provides CLI shortcuts (pw/pwX), permission gates, enforcement hooks, and planning capabilities.

**Architecture:** Separate, independent repository (`project-workflow-plugin`) designed for distribution via marketplace or git submodule. Five-phase implementation with self-testing. Reference implementation in `shivavakkiyar` repo (this project).

**Deployment Model:**
- **Primary Repo**: `anthropics/project-workflow-plugin` (NEW - standalone, marketplace-ready)
- **Reference Impl**: `shivavakkiyar` (THIS REPO - installs via git submodule or marketplace)
- **Distribution**: PyPI, GitHub releases, Claude Code marketplace

**Tech Stack:** 
- Python 3.7+ (core, portable)
- Podman/podman-compose (project-agnostic, configurable)
- Bash (CLI shortcuts)
- JSON/YAML (configuration, marketplace metadata)
- pytest (100% coverage)

**Portability Requirements:**
- Project-agnostic (works with any repo structure via config)
- `PROJECT_ROOT` environment variable support
- Configurable container names, test directories, branch patterns
- Installation docs for other projects
- No hard-coded paths to shivavakkiyar project

---

## Marketplace & Distribution

### Publishing Requirements (Phase 5+)
- [ ] PyPI package metadata (setup.py / pyproject.toml)
- [ ] GitHub releases with version tags
- [ ] Claude Code marketplace listing (README.md, marketplace metadata)
- [ ] Installation instructions (pip, git clone, marketplace)
- [ ] Usage documentation for any project type
- [ ] License (choose: MIT, Apache 2.0, etc.)
- [ ] CONTRIBUTING.md for other developers
- [ ] Automated tests run on every commit (GitHub Actions)
- [ ] Release automation (auto-publish to PyPI/marketplace on tag)

### Installation Methods (for other projects)
```bash
# Method 1: PyPI (when published)
pip install project-workflow-plugin

# Method 2: Git clone (standalone)
git clone https://github.com/anthropics/project-workflow-plugin.git ~/.claude/plugins/

# Method 3: Git submodule (in consuming project)
git submodule add https://github.com/anthropics/project-workflow-plugin.git .claude/plugins/project-workflow-plugin

# Method 4: Claude Code marketplace (when approved)
# User installs directly from marketplace UI
```

---

## Phase 1: Plugin Foundation (4 Tasks)

### Task 0044a: Create Plugin Manifest & Directory Structure

**Files:**
- Create: `.claude/plugins/project-workflow-plugin/plugin.yaml`
- Create: `.claude/plugins/project-workflow-plugin/config/defaults.json`
- Create: `.claude/plugins/project-workflow-plugin/config/enforcement_rules.json`
- Create: `.claude/plugins/project-workflow-plugin/config/task_detection_rules.json`
- Create: `.claude/plugins/project-workflow-plugin/cli/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/cmd/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/hooks/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/utils/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/tests/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/rules/plugin_enforcement.md`
- Modify: `.gitignore`

**Implementation Steps:**

1. Create directory structure
2. Create plugin.yaml with manifest, hooks config, rules list
3. Create defaults.json with all configuration values
4. Create enforcement_rules.json with validation schema
5. Create task_detection_rules.json for FEA:/BUG: parsing
6. Create all __init__.py files
7. Update .gitignore to exclude claudeplan/
8. Commit: "feat: Create project-workflow-plugin structure and configuration"

**Success Criteria:**
- All directories exist
- plugin.yaml valid YAML with correct structure
- defaults.json has all required config keys
- enforcement_rules.json has before_prompt_sent, before_edit, before_commit, before_merge, before_push sections
- .gitignore updated for claudeplan/

---

### Task 0044b: Implement pw CLI Entry Point with Config Loading

**Files:**
- Create: `.claude/plugins/project-workflow-plugin/cli/pw`
- Create: `.claude/plugins/project-workflow-plugin/cli/pw.py`
- Create: `.claude/plugins/project-workflow-plugin/cli/utils/config_loader.py`
- Create: `.claude/plugins/project-workflow-plugin/cli/utils/__init__.py`
- Create: `.claude/plugins/project-workflow-plugin/tests/test_cli_basic.py`

**Implementation Steps:**

1. Write failing test for CLI entry point (pw --help, pw --version)
2. Create ConfigLoader class that loads defaults.json, enforcement_rules.json, task_detection_rules.json
3. Create PWCli class with argument parser
4. Implement --help and --version arguments
5. Create shell wrapper (pw) that delegates to pw.py
6. Make wrapper executable
7. Write tests for config loading
8. Commit: "feat: Implement pw CLI entry point with config loading"

**Success Criteria:**
- `pw --help` displays help message
- `pw --version` displays 1.0.0
- `pw h` shows help
- ConfigLoader correctly loads all JSON files
- Tests pass (at least 4/4)

---

### Task 0044c: Implement Basic Commands (help, status, check-setup)

**Files:**
- Create: `.claude/plugins/project-workflow-plugin/cmd/help.py`
- Create: `.claude/plugins/project-workflow-plugin/cmd/status.py`
- Create: `.claude/plugins/project-workflow-plugin/cmd/check_setup.py`
- Create: `.claude/plugins/project-workflow-plugin/tests/test_help_status.py`
- Modify: `.claude/plugins/project-workflow-plugin/cli/pw.py`

**Implementation Steps:**

1. Write tests for help (shows all commands, shows specific help)
2. Create help.py with HELP_TEXT and COMMAND_HELP dictionary
3. Implement show_help() function
4. Write tests for status command
5. Create status.py with get_current_branch(), get_current_version(), show_status()
6. Write tests for check-setup
7. Create check_setup.py with validation functions (Python, git, podman, hooks, test container)
8. Integrate commands into pw.py argument parser
9. Commit: "feat: Implement basic commands (help, status, check-setup)"

**Success Criteria:**
- `pw h` shows full help with all commands
- `pw h [cmd]` shows command-specific help
- `pw st` shows current branch and version
- `pw check-setup` validates environment (Python 3.7+, git, podman, podman-compose, hooks, test container)
- All tests pass (8+/8)

---

### Task 0044d: Create CLI Shortcuts (pws, pwt, pwc, pwf, pwp, pwr, pwst, pwl, pwh, pwcan, pwplan)

**Files:**
- Create: `.claude/plugins/project-workflow-plugin/cli/pws`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwt`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwc`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwf`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwp`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwr`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwst`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwl`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwh`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwcan`
- Create: `.claude/plugins/project-workflow-plugin/cli/pwplan`
- Create: `.claude/plugins/project-workflow-plugin/tests/test_cli_shortcuts.py`

**Implementation Steps:**

1. Write tests that verify all shortcuts exist and are executable
2. Create shell script templates for each shortcut (pws, pwt, pwc, pwf, pwp, pwr, pwst, pwl, pwh, pwcan, pwplan)
3. Each script forwards to pw.py with appropriate command
4. Make all scripts executable (chmod +x)
5. Create symlinks in scripts/pw-shortcuts/ for easy access
6. Commit: "feat: Add CLI shortcuts for all commands"

**Success Criteria:**
- All 11 shortcuts exist in cli/ directory
- All shortcuts are executable
- `pws --help` → `pw s --help`
- `pwt` → `pw t`
- Tests pass (at least 11+/11)
- Shortcuts can be called from anywhere (if added to PATH)

---

## Phase 2: Core Workflow Commands (5 Tasks)

### Task 0045: Implement pws (Start Feature Workflow)

**Description:** Create feature/wt-NNNN-name branch with validation, hook setup, and guidance.

**Prerequisites:** Task 0044 complete

---

### Task 0046: Implement pwt (Test with Coverage)

**Description:** Run tests in container with optional coverage reporting.

**Prerequisites:** Task 0044 complete

---

### Task 0047: Implement pwc (Commit with Permission Gate)

**Description:** Commit with y/n confirmation, test validation, coverage validation, task ID verification.

**Prerequisites:** Task 0044 complete

---

### Task 0048: Implement pwf (Finish & Merge)

**Description:** Merge feature branch to main with permission gate, version bump.

**Prerequisites:** Task 0047 complete

---

### Task 0049: Implement pwp (Push to GitHub)

**Description:** Push to GitHub with permission gate.

**Prerequisites:** Task 0048 complete

---

## Phase 3: Requirements & Planning (4 Tasks)

### Task 0050: Implement pwr (Requirement Task Only)

**Description:** Create requirement task file without feature branch or code.

---

### Task 0051: Create ./claudeplan/ Manager

**Description:** Create plan directory manager, .gitignore handling, plan file creation.

---

### Task 0052: Implement pw plan (Working Plan Creation)

**Description:** Create working plan in ./claudeplan/ with auto-generated templates.

---

### Task 0053: Implement pw plan promote (Convert Plan to Task)

**Description:** Promote ./claudeplan/NNNN-*.md to tasks/NNNN-*.md.

---

## Phase 4: Enforcement & Intelligence (4 Tasks)

### Task 0054: Enhance Pre-Submit Hook (FEA:/BUG: Detection)

**Description:** Detect FEA:/BUG: prefixes in prompts, parse sub-tasks.

---

### Task 0055: Implement Sub-Task Auto-Creation

**Description:** Auto-create task files from detected sub-tasks.

---

### Task 0056: Implement Auto-Executor for High-Priority Subs

**Description:** Auto-execute high-priority sub-workflows.

---

### Task 0057: Add 100% Coverage Enforcement

**Description:** Block merge if coverage < 100%.

---

## Phase 5: Polish & Testing (3 Tasks)

### Task 0058: Comprehensive Test Coverage (100%)

**Description:** Write tests to achieve 100% coverage of plugin code.

---

### Task 0059: Documentation & Help System

**Description:** Complete documentation, command reference, help texts.

---

### Task 0060: Environment Validation & Final Testing

**Description:** Final validation, real workflow testing, documentation updates.

---

## Execution Notes

- Each task uses TDD: write failing test → implement → verify → commit
- Run tests in container: `podman-compose run --rm saivamcloud-test pytest <path>`
- All tests must pass before commit
- Each commit references task ID: `Fixes #NNNN`
- No code on main branch directly (use feature/wt-* branches)
