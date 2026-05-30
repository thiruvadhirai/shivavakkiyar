---
id: 0008
title: Implement Workflow Enforcement Hooks (UserPromptSubmit + Git)
status: open
impact: Critical
priority: P1
complexity: "2-3 hours"
assignee: Claude
created: 2026-05-30
linked_tasks: [0002, 0003, 0007]
---

# Description

Implement actual enforcement of the development workflow using Claude Code hooks. The problem: Rules and documentation are advisory - Claude can ignore them. Solution: Use **UserPromptSubmit hooks** to block prompt submission if workflow requirements aren't met, BEFORE any token generation.

## Root Cause of Previous Failures

1. **Rules/skills are advisory** — I could ignore them
2. **PreToolUse blocks after decision-making** — Inefficient, wastes tokens
3. **Settings.json was incomplete** — Missing enforcement mechanism
4. **No pre-submission validation** — Nothing blocked workflow violations at prompt entry

## Solution: Multi-Layer Enforcement

### Layer 1: UserPromptSubmit Hook (BLOCKS BEFORE TOKEN GENERATION)
- Fires before Claude processes user prompt
- Can inspect prompt for workflow requirements
- Returns deny decision with reason
- Forces correction BEFORE work starts

### Layer 2: Git Pre-Commit Hook
- Blocks commits to main branch
- Requires feature branch context
- Validates task ID in commit message

### Layer 3: Git Pre-Push Hook  
- Blocks pushes to origin/main
- Requires merge to be from feature branch

## Files to Create/Update

### 1. `.claude/hooks/enforce-workflow.sh` (NEW)
UserPromptSubmit hook script that:
- ✅ Detects if prompt requests code changes
- ✅ Checks for required workflow elements (task ID, feature branch, test plan)
- ✅ Blocks prompt if requirements missing
- ✅ Returns JSON deny decision with helpful message

### 2. `.claude/hooks/pre-commit-enforce.sh` (NEW)
Git pre-commit hook that:
- ✅ Detects current branch
- ✅ Blocks commits to main (exit 1)
- ✅ Validates task ID in commit message
- ✅ Returns clear error message

### 3. `.claude/hooks/pre-push-enforce.sh` (NEW)
Git pre-push hook that:
- ✅ Detects push destination
- ✅ Blocks pushes to origin/main
- ✅ Allows only fast-forward merges to main
- ✅ Returns clear error message

### 4. `.claude/settings.json` (UPDATE)
Add hooks configuration:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/enforce-workflow.sh"
          }
        ]
      }
    ]
  }
}
```

### 5. `scripts/setup-hooks.py` (UPDATE)
Update to install both Claude hooks and git hooks:
- Install git pre-commit hook
- Install git pre-push hook
- Make them executable
- Run on `feature-workflow.py start`

## Workflow Enforcement Rules

### Before Prompt Submission (UserPromptSubmit)
Prompt must contain one of:
```
"[Task 000X]"
"Fixes #000X"
"task 000X"
"task ID"
```

Or be a question (starts with "?")

### Before Git Commit (pre-commit)
- ✅ Must be on feature/* branch (not main)
- ✅ Commit message must reference task ID (#NNNN)
- ✅ VERSION will auto-increment

### Before Git Push (pre-push)
- ✅ Can only push feature/* branches
- ✅ Cannot push directly to origin/main
- ✅ Must merge via feature-workflow.py finish

## Implementation Details

### Hook Input/Output Format

**UserPromptSubmit Input** (JSON on stdin):
```json
{
  "prompt": "user's message text",
  "conversationHistory": [...],
  "projectContext": {...}
}
```

**Hook Response** (JSON to stdout):
```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny|allow|ask",
    "permissionDecisionReason": "Reason message",
    "permissionDecisionContext": "Additional details"
  }
}
```

**Decision Values:**
- `"allow"` — Permit prompt submission
- `"deny"` — Block prompt, show reason
- `"ask"` — Prompt user for confirmation

## Acceptance Criteria

✅ UserPromptSubmit hook created and blocks prompts without task context  
✅ Git pre-commit hook blocks commits to main branch  
✅ Git pre-push hook blocks pushes to origin/main  
✅ All hooks return clear error messages with instructions  
✅ Scripts updated to install hooks automatically  
✅ Hooks work on session start and prompt submission  
✅ Workflow cannot be bypassed (hard enforcement)  
✅ All 85 tests still passing  

## Testing Plan

```bash
# 1. Test UserPromptSubmit hook
#    (Ask Claude to make code change without mentioning task)
#    Expected: Prompt blocked with message

# 2. Test with proper task reference
#    "I'm working on Task 0008. [change request]"
#    Expected: Prompt allowed

# 3. Test git pre-commit
#    git checkout main
#    git commit -m "test"
#    Expected: Commit blocked, error message shown

# 4. Test git pre-push
#    git push origin main
#    Expected: Push blocked, error message shown

# 5. Test proper workflow
#    ./scripts/feature-workflow.py start 0008-...
#    # Make changes
#    ./scripts/feature-workflow.py commit "Msg with #0008"
#    Expected: Everything works
```

## Why This Works

1. **UserPromptSubmit blocks BEFORE token generation** — No wasted computation
2. **Git hooks block at source control level** — Cannot bypass even if Claude tries
3. **Multi-layer enforcement** — Works at both Claude and Git levels
4. **Deterministic and guaranteed** — Hooks always execute, cannot be ignored
5. **Clear error messages** — User knows exactly what's required

## Documentation References

- [Claude Code Hooks Lifecycle](https://code.claude.com/docs/en/hooks#hook-lifecycle)
- [Hook Resolution](https://code.claude.com/docs/en/hooks#how-a-hook-resolves)
- [Prompt and Agent Hook Fields](https://code.claude.com/docs/en/hooks#prompt-and-agent-hook-fields)

## Related Tasks

- Task 0003: Pre-commit hook (version increment) — will be enhanced
- Task 0002: Settings.json (incomplete enforcement) — will be completed
- Task 0007: Incomplete due to workflow violation — this fixes the root cause

---

**This task implements the actual enforcement mechanism that was missing from the beginning.**

Once complete, the workflow becomes non-bypassable:
- UserPromptSubmit hook blocks prompts without task context
- Git hooks prevent direct main commits/pushes
- Feature branch workflow is the only path forward
