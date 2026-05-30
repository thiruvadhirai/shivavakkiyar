---
id: 0022
title: Convert shell scripts to Python and enforce Python-only rule
status: open
impact: Infrastructure
priority: 025
complexity: "30-45 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

Current shell scripts in `scripts/` are fragile and hard to maintain:
1. `scripts/claudeinvestigate/findjsonfiles.sh` uses hardcoded paths (`/home/jsnadmin/apps/...`)
2. No consistent approach to what should be shell vs Python
3. No rule enforcement for future scripts
4. Shell scripts can't access environment variables cleanly

## Scope

### 1. Convert findjsonfiles.sh → findjsonfiles.py

**Current issues:**
- Hardcoded path: `/home/jsnadmin/apps/shivavakkiyar/`
- Should use environment variable or relative path
- Complex bash piping, harder to debug

**New approach:**
- Python script with argparse
- Use `os.getcwd()` or env var `PROJECT_ROOT` 
- Clear, readable implementation
- Same output format as bash version

### 2. Add Workflow Rule

Create `.claude/rules/scripts.md` (glob: `scripts/**`)

**Rule enforces:**
- All new CLI scripts MUST be Python (`.py`)
- Exception: Shell scripts ONLY if:
  - Shell language is unavoidable (rare: complex heredocs, process substitution)
  - Documented reason in file header comment
- All scripts MUST use environment variable for project root, NOT hardcoded paths
- Scripts in `scripts/claudeinvestigate/` are dev helpers, not production
- Execution: Always in container via `podman exec` or `feature-workflow.py`, never on host

**Example in rule:**
```
✅ CORRECT:
PROJECT_ROOT = os.getenv('PROJECT_ROOT', os.getcwd())
config_path = os.path.join(PROJECT_ROOT, '.claude', 'config.json')

❌ WRONG:
config_path = '/home/jsnadmin/apps/shivavakkiyar/.claude/config.json'
```

### 3. Update settings.json Permissions

Add to allowlist if needed:
- `Bash(python3 scripts/claudeinvestigate/* *)`
- `Bash(python3 scripts/*)` (for future Python scripts)

## Acceptance Criteria

- [ ] `findjsonfiles.py` created with same functionality as shell version
- [ ] Uses environment variable for project root (not hardcoded)
- [ ] `.claude/rules/scripts.md` created and enforces Python-first
- [ ] `scripts/claudeinvestigate/findjsonfiles.sh` deleted (after Python version tested)
- [ ] Updated permissions in settings.json
- [ ] Both old and new versions tested and produce identical output

## Definition of Done

✅ Conditions met:
1. `scripts/claudeinvestigate/findjsonfiles.py` works identically to bash version
2. Can run: `PROJECT_ROOT=/path/to/repo python3 scripts/claudeinvestigate/findjsonfiles.py`
3. `.claude/rules/scripts.md` in place and loaded by Claude Code
4. Shell version deleted from source control
5. All tests still pass

## Notes

The rule is about FUTURE scripts. Existing shell scripts (setup-hooks.sh, push-to-github.sh) can stay if they work, but new scripts default to Python.
