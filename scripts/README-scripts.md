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

### get-version.py ✅ (Active)
**Purpose:** Read VERSION file and output in different formats (plain, JSON, YAML, HTML)  
**Usage:**
```bash
python3 scripts/get-version.py                # Plain: 1.0.0-beta.8
python3 scripts/get-version.py --json         # JSON format
python3 scripts/get-version.py --yaml         # YAML format  
python3 scripts/get-version.py --html         # HTML badge for templates
```
**Used By:** Jekyll templates, CI/CD, version display  
**Why:** Single source of truth - VERSION file is the source, this reads it  

### generate-features.py (Planned)
Auto-generate features.json from FEATURES.md. Runs automatically via git pre-commit hook.

### update-iteration-log.py (Planned)
Update ITERATION_LOG.md with clarifications and decisions.

### sync-docs.py (Planned)
Synchronize FEATURES.md → features.json → architecture.md → file-impacts.md

### validate-commits.py (Planned)
Pre-commit validation to ensure feature updates are documented.

---

## How Version Management Works

**Flow:**
```
Developer commits changes
    ↓
Post-commit hook runs
    ↓
Hook validates VERSION format (regex check)
    ↓
Hook increments stage number safely (bash arithmetic on numbers only)
    ↓
Hook updates VERSION file
    ↓
Jekyll or templates call: python3 scripts/get-version.py [--format]
    ↓
Display version in footer/badge
```

**Why this approach:**
- ✅ Single VERSION file (no duplication with version.yml)
- ✅ Safe bash arithmetic (validates first, then does math)
- ✅ Python script handles display formatting
- ✅ No git hook conflicts or file sync issues

---

*See .claude/features.json for complete script metadata and versions*
