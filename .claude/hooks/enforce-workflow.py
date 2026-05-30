#!/usr/bin/env python3
"""
UserPromptSubmit Hook - Enforce development workflow BEFORE token generation

This hook runs before Claude processes any prompt.
It checks for workflow requirements and blocks prompts that don't meet them.

Auto-detects project venv:
- If ./venv exists → uses venv python
- Otherwise → uses system python (PATH)

Stdin: JSON with prompt text
Exit 0: Allow prompt
Exit 1: Block prompt
"""

import sys
import os
import json
import re
from pathlib import Path

def use_project_venv_if_available():
    """Re-execute using project venv python if available."""
    # Find project root (script is at .claude/hooks/enforce-workflow.py)
    script_dir = Path(__file__).parent.parent.parent
    venv_python = script_dir / "venv" / "bin" / "python3"

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
    """Enforce workflow requirements on user prompt."""
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Invalid JSON, allow (not our problem)
        return 0
    except Exception:
        # Any other error, allow
        return 0

    # Extract prompt text
    prompt = input_data.get('prompt', '').strip()

    if not prompt:
        # Empty prompt, allow
        return 0

    # Check if this is a question (starts with ?)
    if prompt.startswith('?'):
        # Questions don't require task context
        return 0

    # Check for task ID references
    # Valid patterns: "Task 0001", "[Task 0001]", "Fixes #0001", "#0001"
    task_patterns = [
        r'task\s+[0-9]{4}',
        r'Fixes\s+#[0-9]{4}',
        r'#[0-9]{4}',
        r'Fixes\s+0[0-9]{3}'
    ]

    for pattern in task_patterns:
        if re.search(pattern, prompt, re.IGNORECASE):
            # Valid task reference found, allow prompt
            return 0

    # Check if prompt is requesting code/documentation changes
    change_keywords = [
        'add', 'create', 'implement', 'fix', 'update', 'modify',
        'refactor', 'delete', 'remove', 'change', 'improve'
    ]

    for keyword in change_keywords:
        if re.search(rf'\b{keyword}\b', prompt, re.IGNORECASE):
            # Code change requested but no task ID - BLOCK IT
            error_response = {
                "hookSpecificOutput": {
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Code changes require a task ID",
                    "permissionDecisionContext": (
                        "All changes must start with a task file. "
                        "Mention the task ID in your prompt. "
                        "Example: 'Working on Task 0008. [your request]' "
                        "or 'Fixes #0008: [your request]'"
                    )
                }
            }
            print(json.dumps(error_response))
            return 1

    # If we get here, either:
    # 1. It's a question (allowed)
    # 2. It's a discussion without code changes (allowed)
    # 3. It's advisory/informational (allowed)
    return 0

if __name__ == "__main__":
    sys.exit(main())
