---
id: 0023
title: Add environment variable support to all scripts (no hardcoded paths)
status: open
impact: Infrastructure
priority: 020
complexity: "20-30 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: [0022]
---

## Problem Statement

Scripts currently use hardcoded paths like `/home/jsnadmin/apps/shivavakkiyar/`, which breaks:
- When cloned to different location
- When running in CI/CD
- When running in container (paths differ)
- When running as different user

All scripts should use environment variables for flexibility.

## Scope

### 1. Audit All Scripts

Find all hardcoded paths in:
- `scripts/*.py`
- `scripts/*.sh`
- `.claude/hooks/*.py`

### 2. Update Script Pattern

Create a standard pattern all scripts should follow:

```python
import os
import sys

# Project root from env or current directory
PROJECT_ROOT = os.getenv('PROJECT_ROOT', os.getcwd())

# Derive other paths from PROJECT_ROOT
CLAUDE_CONFIG = os.path.join(PROJECT_ROOT, '.claude', 'config.json')
TASKS_DIR = os.path.join(PROJECT_ROOT, 'tasks')
VERSION_FILE = os.path.join(PROJECT_ROOT, 'VERSION')
```

### 3. Update Each Script

Files to update:
- `scripts/feature-workflow.py` - Update hardcoded paths
- `scripts/push-to-github.py` - Update hardcoded paths
- `scripts/bump-session.py` - Update hardcoded paths
- `scripts/setup-venv.py` - Update hardcoded paths
- `scripts/get-version.py` - Update hardcoded paths
- `.claude/hooks/enforce-workflow.py` - Update hardcoded paths (if any)
- `scripts/setup-hooks.sh` - Update hardcoded paths (if any)

### 4. Execution

Scripts called by Claude must set `PROJECT_ROOT`:
```bash
# Before running script, set env var
PROJECT_ROOT=/home/jsnadmin/apps/shivavakkiyar python3 scripts/feature-workflow.py ...

# Or if called from project root:
PROJECT_ROOT=$(pwd) python3 scripts/feature-workflow.py ...
```

## Acceptance Criteria

- [ ] All scripts audited for hardcoded paths
- [ ] All paths moved to environment variables
- [ ] Fallback to `os.getcwd()` when PROJECT_ROOT not set
- [ ] All scripts tested with PROJECT_ROOT set
- [ ] Documentation updated showing how to call scripts
- [ ] No remaining hardcoded `/home/jsnadmin/...` paths in scripts/

## Definition of Done

✅ Conditions met:
1. Can clone repo to `/tmp/test/shivavakkiyar/`
2. Set `PROJECT_ROOT=/tmp/test/shivavakkiyar`
3. Run any script and it works correctly
4. All tests still pass
5. No hardcoded user paths remain

## Notes

This is a refactoring task. No new functionality, just path flexibility.
Depends on task 0022 (Python scripts created first).
