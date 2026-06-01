---
id: 0003a
title: Migrate Workflow Scripts to Python3 with venv Isolation
status: done
impact: Medium
priority: 030
complexity: "2-3 hours"
assignee: Vairam
created: 2026-05-29
raci:
  responsible: Vairam
  accountable: Vairam
  consulted: []
  informed: [team]
parent: 0003
linked_tasks: [0003]
blocked_by: [0003]
related: []
---

# Description

Convert bash workflow scripts to Python3 for:
- Better cross-platform compatibility (Windows, macOS, Linux)
- Self-executable CLI scripts
- Proper dependency isolation via venv
- Cleaner error handling and logging
- Easier testing and mocking

# Acceptance Criteria

- [x] `scripts/feature-workflow.py` — replaces feature-workflow.sh
  - Commands: start, test, commit, finish, status, list, clean
  - Auto-creates/activates venv
  - Same behavior as bash version
  
- [x] `scripts/setup-hooks.py` — replaces setup-hooks.sh
  - Idempotent hook installation
  - Cross-platform compatibility
  
- [x] `scripts/push-to-github.py` — replaces push-to-github.sh
  - Verify branch, push confirmation, push to origin/main
  
- [x] `scripts/bump-session.py` — replaces bump-session.sh
  - Update .claude/session.json
  - Check for uncommitted changes
  
- [x] `requirements.txt` created
  - Lists Python dependencies for workflow scripts
  - Minimal: likely only standard library, maybe click/typer
  
- [x] `scripts/setup-dev.py` created
  - One-command setup: clone → setup venv → install deps → ready
  - Windows, macOS, Linux support
  
- [x] `.gitignore` updated
  - Ignore venv/ directory
  - Ignore __pycache__, *.pyc, .env
  
- [x] All workflow scripts remain functional
  - Same commands
  - Same error messages
  - Same behavior as bash versions

# Benefits

- ✅ Cross-platform: works on Windows CMD, PowerShell, macOS, Linux
- ✅ Isolated: venv prevents package collisions with other projects
- ✅ Testable: easier to mock and unit test
- ✅ Maintainable: cleaner error handling
- ✅ Self-documenting: help via `--help` flag

# Implementation Notes

**Script Structure:**
```python
#!/usr/bin/env python3
import sys
import os

def main():
    # Auto-setup venv if needed
    # Auto-install requirements
    # Run command
    pass

if __name__ == "__main__":
    main()
```

**Venv Setup:**
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Make executable:**
```bash
chmod +x scripts/feature-workflow.py
# Then call directly:
./scripts/feature-workflow.py start 0001-task-name
```

# Test Plan

1. Test venv creation on first run
2. Test venv reuse on second run
3. Test commands: start, test, commit, finish
4. Test on Windows, macOS, Linux
5. Test help: `./scripts/feature-workflow.py --help`
6. All workflow tests still pass

# Dependencies

- Python 3.8+ (standard on most systems)
- Standard library only (no external deps for workflow scripts)
- Optional: click or typer for CLI (if improvements desired)

# Estimated Time

2-3 hours

# Note

This is a **sub-feature of 0003**. Branch from `feature/0003-persist-hooks` as `feature/0003a-migrate-scripts`. After completion, rebase to main once 0003 is done.
