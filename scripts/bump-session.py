#!/usr/bin/env python3
"""
Bump Claude session counter (called by Claude Stop hook)

This tracks how many conversation turns happened during a session.
Useful for understanding context usage and planning future sessions.

Writes to: .claude/session.json
Format: { "turns": N, "last_update": "ISO-8601 timestamp" }

Usage (called automatically by Claude Stop hook):
    ./scripts/bump-session.py

Or manually:
    python3 scripts/bump-session.py
"""

import sys
import json
from pathlib import Path
from datetime import datetime


def main():
    """Bump session counter."""
    session_file = Path(".claude/session.json")

    # Ensure .claude directory exists
    session_file.parent.mkdir(parents=True, exist_ok=True)

    # Read current session data
    session_data = {"turns": 0, "last_update": None}
    if session_file.exists():
        try:
            session_data = json.loads(session_file.read_text())
        except (json.JSONDecodeError, IOError):
            pass

    # Increment turn counter
    session_data["turns"] = session_data.get("turns", 0) + 1
    session_data["last_update"] = datetime.utcnow().isoformat() + "Z"

    # Write back
    try:
        session_file.write_text(json.dumps(session_data, indent=2))
        return 0
    except (IOError, OSError) as e:
        print(f"⚠️  Warning: Could not update session file: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
