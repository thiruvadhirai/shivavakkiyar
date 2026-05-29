# Iteration & Clarification Workflow

**For when development reveals unclear requirements or BA input is needed.**

---

## When Development Reveals Issues

While building with Claude, you may find:
- Requirements are unclear
- Implementation doesn't match actual needs
- Edge cases weren't specified
- BA needs to clarify something

---

## The Workflow: 3 Steps

### Step 1: Document the Question (5 min)

Edit `.claude/FEATURES.md` and add to the **Clarifications Needed** section:

```markdown
### 🤔 CLARIFICATIONS NEEDED

**Q: Feature X Behavior** (Asked by: Vairam, 2026-05-28)
> When user does Y, should we:
> - (A) Option A?
> - (B) Option B?
> 
> Details: Why this matters for implementation...
```

Commit:
```bash
git add .claude/FEATURES.md
git commit -m "Question: Feature X clarification needed

Q: Feature X behavior
Context: Implementation in progress, need BA input"
```

### Step 2: BA Responds (Same day or next)

BA updates the same section in FEATURES.md:

```markdown
**Q: Feature X Behavior**
> BA Answer (by: BA Name, 2026-05-28 3pm):
> Choose Option A because...
```

Commit:
```bash
git commit -m "Clarification: Feature X behavior

BA Decision: Choose Option A because [reasoning]"
```

### Step 3: Continue with Claude

Show Claude the updated FEATURES.md section:

```
Developer: "BA clarified the requirement. Here's the update:

[Paste updated FEATURES.md section with clarification]

Please update the code based on this clarification."
```

Claude reads the clarification and continues building.

### Step 4: Document Resolution

Update FEATURES.md with the implementation result:

```markdown
**Q: Feature X Behavior**
> BA Answer: Choose Option A...
> **Resolution:** ✅ Implemented Option A
> **Commit:** abc123d - "Implement clarification: Feature X behavior"
> **Tests:** Updated/all passing
```

Commit:
```bash
git commit -m "Implement clarification: Feature X behavior

Based on BA decision, updated:
- Function X to use Option A
- Tests updated to reflect Option A
- See FEATURES.md for context"
```

---

## Real Example

```
Day 1 - 2pm: Developer building Location Manager
  Question: "Should autocomplete show all or top 5 results?"
  Updates FEATURES.md with question
  Commits: "Question: autocomplete result limit"

Day 1 - 3pm: BA reviews GitHub issue & FEATURES.md
  Adds clarification: "Show ALL results. Users will type to narrow."
  Commits: "Clarification: show all autocomplete results"

Day 1 - 3:15pm: Developer continues with Claude
  Shows Claude the updated requirement
  Claude updates code: top 5 → all results
  Commits: "Implement clarification: show all results"

Day 1 - 5pm: Feature complete ✅
  All clarifications documented and resolved
```

---

## Why This Matters

✅ **No Context Loss** - Claude can see the clarification in FEATURES.md  
✅ **Traceability** - Every decision has BA's reasoning attached  
✅ **History** - Future developers understand WHY things were built  
✅ **Prevents Rework** - Clarifications guide implementation, reducing waste  
✅ **Synchronous or Async** - Works whether BA is in same room or different timezone  

---

## Tips for Success

1. **Ask Early** - When confused, ask immediately, don't guess
2. **Be Specific** - "Is this right?" is vague. "Should we X, Y, or Z?" is clear
3. **Link to Context** - "In the location widget, should..." is better than "Should we..."
4. **One Question Per Section** - Multiple questions in same section can confuse git blame
5. **Quote BA's Reasoning** - "Show all because users filter by typing" explains the why
6. **Test After Clarification** - Don't assume. Verify your implementation matches the clarification

---

## Pre-Commit Checklist

Before committing clarification-related changes:

- [ ] Question or clarification added to FEATURES.md?
- [ ] Commit message references the feature?
- [ ] If implementing: Code matches clarification?
- [ ] If implementing: Tests updated for new behavior?
- [ ] Did you verify with BA (if synchronous)?
- [ ] ITERATION_LOG.md entry updated (if major clarification)?

---

*This workflow ensures Claude, developers, and business analysts stay perfectly aligned.*
