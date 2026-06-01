---
id: 0024
title: Add cross-references between DEVELOPMENT.md and architecture.md
status: done
impact: Documentation
priority: 030
complexity: "15-20 minutes"
assignee: dev
raci:
  responsible: dev
  accountable: tech-lead
  consulted: 
  informed: 
dependencies: []
---

## Problem Statement

DEVELOPMENT.md and architecture.md overlap in content:
- Both describe directory structure
- Both mention testing
- Both explain Jekyll/containers (~30% redundancy)

This creates confusion about which doc to read and duplicate maintenance burden.

## Solution

Add cross-references to clarify each document's purpose:
- **DEVELOPMENT.md**: "How do I get started and run things?" (procedures)
- **architecture.md**: "What depends on what?" (structure/relationships)

## Acceptance Criteria

- [ ] DEVELOPMENT.md adds reference to architecture.md for dependency/structure info
- [ ] architecture.md adds reference to DEVELOPMENT.md for setup/procedure info
- [ ] Each reference is at the top of relevant section
- [ ] Both docs are more valuable when read together (but can stand alone)
- [ ] No content deleted (cross-refs only)

## Implementation

### In DEVELOPMENT.md

Add near top (after intro):
```markdown
## 📚 Documentation Structure

This guide covers **how to get started**. For understanding file relationships and dependencies, see [architecture.md](.claude/architecture.md).
```

Add in "Container Management" section:
```markdown
See [architecture.md](.claude/architecture.md) for the build & deployment pipeline diagram.
```

### In architecture.md

Add in introduction section:
```markdown
**For step-by-step setup and development procedures, see [DEVELOPMENT.md](.claude/DEVELOPMENT.md).**
```

## Definition of Done

✅ Both documents link to each other
✅ No content removed (pure additions)
✅ Cross-references positioned logically
✅ Tests still passing
✅ Committed with task ID
