#!/usr/bin/env python3
"""
Git Pre-Push Hook - Allow pushes to origin/main after feature merge

This hook allows pushing to origin/main (no PR workflow required).
Workflow relies on pre-commit hook to block main branch commits
and feature-workflow.py to manage merge process.

Auto-detects project venv:
- If ./venv exists → uses venv python
- Otherwise → uses system python (PATH)

Exit 0: Allow push
Exit 1: Block push
"""

import sys
import os
from pathlib import Path

# Get project root from environment or derive from script location
PROJECT_ROOT = Path(os.getenv('PROJECT_ROOT', Path(__file__).parent.parent.parent))

def use_project_venv_if_available():
    """Re-execute using project venv python if available."""
    venv_python = PROJECT_ROOT / "venv" / "bin" / "python3"

    # Only proceed if venv exists and we're not already using it
    if not venv_python.exists():
        return  # Project venv doesn't exist, use system python

    # Check if we're already using the venv python
    try:
        current_executable = Path(sys.executable).resolve()
        venv_executable = venv_python.resolve()
        if current_executable == venv_executable:
            return  # Already using venv python
    except Exception:
        return  # Can't resolve, use current python

    # Re-execute with venv python
    try:
        os.execv(str(venv_python), [str(venv_python)] + sys.argv)
    except Exception:
        # If execv fails, continue with current python
        pass

# Auto-detect and use project venv if available
use_project_venv_if_available()

def main():
    """Allow all pushes (no PR workflow required)."""
    # No restrictions - workflow enforcement happens at:
    # 1. Pre-commit: blocks commits to main
    # 2. feature-workflow.py: manages merging to main
    # 3. UserPromptSubmit: blocks prompts without task ID

    # Therefore, all pushes to origin/main are safe
    return 0

if __name__ == "__main__":
    sys.exit(main())
