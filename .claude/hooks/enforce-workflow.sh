#!/bin/bash
# UserPromptSubmit Hook - Enforce development workflow BEFORE token generation
# This hook runs before Claude processes any prompt
# It checks for workflow requirements and blocks prompts that don't meet them

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract prompt text
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

# Check if this is a question (starts with ?)
if [[ "$PROMPT" =~ ^[[:space:]]*\? ]]; then
  # Questions don't require task context
  exit 0
fi

# Check for task ID references in prompt
# Valid patterns: "Task 0001", "[Task 0001]", "Fixes #0001", "#0001"
if echo "$PROMPT" | grep -qiE '(task[[:space:]]+[0-9]{4}|Fixes[[:space:]]+#[0-9]{4}|#[0-9]{4}|Fixes[[:space:]]+0[0-9]{3})'; then
  # Valid task reference found, allow prompt
  exit 0
fi

# Check if prompt is requesting code/documentation changes
if echo "$PROMPT" | grep -qiE '(add|create|implement|fix|update|modify|refactor|delete|remove|change|improve)[[:space:]]'; then
  # Code change requested but no task ID - BLOCK IT
  cat << 'EOF' | jq -R -s 'fromjson | {hookSpecificOutput: .}'
{
  "permissionDecision": "deny",
  "permissionDecisionReason": "Code changes require a task ID",
  "permissionDecisionContext": "All changes must start with a task file. Mention the task ID in your prompt. Example: 'Working on Task 0008. [your request]' or 'Fixes #0008: [your request]'"
}
EOF
  exit 1
fi

# If we get here, either:
# 1. It's a question (allowed)
# 2. It's a discussion without code changes (allowed)
# 3. It's advisory/informational (allowed)
exit 0
