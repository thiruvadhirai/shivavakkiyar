# Developer Tools & Automation Scripts

Store all Claude-generated utility scripts here to prevent duplication and loss of work.

## Script Tracking

All scripts are tracked in `.claude/features.json` under "developer-tools-automation" feature.

## How It Works

```
Developer asks Claude for a utility script
    ↓
Claude creates script in scripts/ folder
    ↓
Script added to features.json with version/purpose
    ↓
Next session: Claude reads features.json
    ↓
Claude knows script exists and reuses/updates it
    ↓
✅ No duplication, no lost work
```

---

## Available Scripts

### generate-features.py
Auto-generate features.json from FEATURES.md. Runs automatically via git pre-commit hook.

### update-iteration-log.py
Update ITERATION_LOG.md with clarifications and decisions.

### sync-docs.py
Synchronize FEATURES.md → features.json → architecture.md → file-impacts.md

### validate-commits.py
Pre-commit validation to ensure feature updates are documented.

---

*See .claude/features.json for complete script metadata and versions*
