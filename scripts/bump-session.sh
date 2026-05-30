#!/bin/bash
# Called by Claude Stop hook after each turn
# Bumps session counter only if there are uncommitted code changes

TRACKED_DIRS="assets/ _includes/ tests/"
SESSION_FILE=".claude/session.json"

# Check if there are uncommitted changes in tracked code dirs
if git diff --quiet HEAD -- $TRACKED_DIRS 2>/dev/null && \
   git diff --cached --quiet -- $TRACKED_DIRS 2>/dev/null; then
  exit 0  # No code changes, don't bump
fi

# Read current session state
if [ -f "$SESSION_FILE" ]; then
  COUNT=$(python3 -c "import json,sys; d=json.load(open('$SESSION_FILE')); print(d.get('turns',0))" 2>/dev/null || echo "0")
else
  COUNT=0
fi

# Bump turn counter and write back
python3 -c "
import json, datetime
data = {
    'turns': $COUNT + 1,
    'last_change': datetime.datetime.now().isoformat(),
    'version': open('VERSION').read().strip()
}
with open('$SESSION_FILE', 'w') as f:
    json.dump(data, f, indent=2)
" 2>/dev/null || true

exit 0
