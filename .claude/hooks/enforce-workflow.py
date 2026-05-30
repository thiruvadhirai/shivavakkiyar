#!/usr/bin/env python3
"""
UserPromptSubmit Hook - Enforce development workflow BEFORE token generation

This hook runs before Claude processes any prompt.
It checks for workflow requirements and blocks prompts that don't meet them.

Stdin: JSON with prompt text
Exit 0: Allow prompt
Exit 1: Block prompt
"""

import sys
import json
import re

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
