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
import subprocess
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

def get_current_branch():
    """Get current git branch (for detecting feature/* context)."""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True, text=True, check=True,
            cwd=str(Path(__file__).parent.parent.parent)
        )
        return result.stdout.strip()
    except Exception:
        return 'unknown'

def get_next_task_id():
    """Find next available NNNN task ID by scanning tasks/ directory."""
    tasks_dir = Path(__file__).parent.parent.parent / 'tasks'
    ids = []
    if tasks_dir.exists():
        for f in tasks_dir.glob('[0-9][0-9][0-9][0-9]-*.md'):
            m = re.match(r'^(\d{4})', f.name)
            if m:
                ids.append(int(m.group(1)))
    return f'{max(ids) + 1:04d}' if ids else '0001'

def slugify(text, max_len=35):
    """Convert text to a branch-safe slug."""
    slug = re.sub(r'[^a-z0-9\s]', '', text.lower())
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug[:max_len].rstrip('-')

def parse_fea_bug_prompt(prompt):
    """
    Detect FEA:/BUG: prefix and parse numbered items.
    FEA: 1. A 2. B  → (FEA, None, [A, B])   — independent tasks
    FEA0010: 1. A 2. B → (FEA, '0010', [A, B]) — sub-tasks of 0010
    Returns (type, parent_id, items) or (None, None, None).
    """
    m = re.match(r'^(FEA|BUG)(\d+)?:\s*(.*)', prompt, re.IGNORECASE | re.DOTALL)
    if not m:
        return None, None, None
    prefix = m.group(1).upper()
    parent_id = f'{int(m.group(2)):04d}' if m.group(2) else None
    body = m.group(3).strip()
    if re.search(r'^\d+\.\s', body):
        items = [i.strip() for i in re.split(r'\s+\d+\.\s+', ' ' + body) if i.strip()]
    else:
        items = [body] if body else []
    return prefix, parent_id, items

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

    # --- FEA:/BUG: structured entry point ---
    prompt_type, parent_id, items = parse_fea_bug_prompt(prompt)
    if prompt_type and items:
        next_id_int = int(get_next_task_id())
        current_branch = get_current_branch()
        branch_prefix = 'fea' if prompt_type == 'FEA' else 'bug'
        on_feature = current_branch.startswith('feature/')

        suggestions = []
        commands = []
        for i, item in enumerate(items):
            # Each item gets its own incremented task ID
            # If parent_id is specified, add --sub-of flag
            if parent_id:
                item_id = f'{next_id_int + i:04d}'
                sub_flag = f' --sub-of {parent_id}'
            else:
                item_id = f'{next_id_int + i:04d}'
                sub_flag = ''
            slug = slugify(item)
            branch_name = f'{branch_prefix}-{item_id}-{slug}'
            suggestions.append(f"  {i+1}. requirement/{branch_name}  (task {item_id})")
            commands.append(
                f"  ./scripts/feature-workflow.py requirement {branch_name}{sub_flag}"
            )

        worktree_note = ""
        if on_feature:
            proj = Path(__file__).parent.parent.parent.name
            worktree_note = (
                f"\n[On feature branch '{current_branch}' — use a worktree + sub-agent:]\n"
                f"  git worktree add ../{proj}-req requirement/{branch_prefix}-<next-id>-<slug>\n"
                f"  (spawn sub-agent in that worktree to create requirements)\n"
                f"  git worktree remove ../{proj}-req  (when done)\n"
            )

        sub_note = f" (sub-tasks of #{parent_id})" if parent_id else ""
        context = (
            f"Detected {len(items)} {prompt_type} item(s){sub_note}.\n\n"
            f"Parsed items:\n" +
            "\n".join(f"  {i+1}. {item}" for i, item in enumerate(items)) +
            f"\n\nBranch suggestions:\n" + "\n".join(suggestions) +
            f"\n\nRelationship options (add additional flags if needed):\n"
            f"  --depends-on <task-id>   this task is blocked by another\n"
            f"  --blocks <task-id>       this task unblocks another\n\n"
            f"Commands to run:\n" + "\n".join(commands) +
            worktree_note
        )

        error_response = {
            "hookSpecificOutput": {
                "permissionDecision": "deny",
                "permissionDecisionReason": f"{prompt_type}: {len(items)} item(s) detected — create requirement branch(es) first",
                "permissionDecisionContext": context
            }
        }
        print(json.dumps(error_response))
        return 1
    # --- end FEA:/BUG: ---

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
