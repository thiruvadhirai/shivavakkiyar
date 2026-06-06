---
name: requirement-workflow
description: Unified workflow for requirements - design, plan, and merge to main
---

# Requirement Workflow Skill

**Purpose**: Orchestrate the complete requirement phase — from design exploration through implementation planning — then merge to main and hand off to feature-workflow.

**When to use**: You're on a `requirement/*` branch and need to:
1. Design the feature (brainstorming)
2. Create design documentation
3. Plan the implementation (writing-plans)
4. Commit both to requirement branch
5. Merge to main

**Workflow Context**: This skill bridges your project's two phases:
- **Requirement phase** (this skill): Design + planning
- **Feature phase** (feature-workflow): Implementation + testing

---

## Quick Start

### You're on a requirement branch (`requirement/fea-NNNN-*`)

```bash
# 1. Invoke this skill
/requirement-workflow

# 2. Skill will:
#    - Run brainstorming for design exploration
#    - Create design doc in docs/superpowers/specs/
#    - Run writing-plans for implementation plan
#    - Create plan in docs/superpowers/plans/
#    - Guide you through commit + merge

# 3. Merge requirement branch to main
./scripts/feature-workflow.sh finish

# 4. Create feature branch for implementation
./scripts/feature-workflow.sh start NNNN-short-title

# 5. Implement using the plan
```

---

## The Three Phases

### Phase 1: Brainstorming (Design Exploration)
- Explore user intent, requirements, success criteria
- Understand context and constraints
- Propose 2-3 implementation approaches with trade-offs
- Present design and get user approval

**Output**: Validated design (in your head, or notes)

### Phase 2: Design Documentation
- Write formal design spec to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Self-review for clarity, consistency, scope
- Get user approval on written spec

**Output**: Design spec file committed to requirement branch

### Phase 3: Implementation Planning
- Invoke writing-plans skill (from superpowers plugin)
- Plan breaks down design into implementation steps
- Identify critical files, dependencies, test strategy
- User reviews and approves plan

**Output**: Implementation plan file in `docs/superpowers/plans/`

### Phase 4: Merge to Main
- Commit design + plan to requirement branch
- Merge requirement branch to main
- Task file + design doc + plan are now in main for feature-workflow to reference

---

## Step-by-Step Flow

### Before Using This Skill

**Prerequisite**: You must be on a `requirement/*` branch:

```bash
# Current branch should be something like:
# requirement/fea-0045-url-state-modal-panchangam

git branch
# * requirement/fea-0045-url-state-modal-panchangam
#   main
```

**If not on requirement branch yet**: 

```bash
# Use FEA:/BUG: prompt to create requirement branch
# Example: type in any message starting with "FEA:" or "BUG:"
# Enforce-workflow hook will block and provide commands

FEA: Add URL state management to calculator

# Hook will output:
# Suggested branch: requirement/fea-0045-url-state-management
# Run: ./scripts/feature-workflow.py requirement fea-0045-url-state-management
```

### Using the Skill

#### 1. **Start Brainstorming**

User types:
```
/requirement-workflow
```

Skill responds:
```
You're on requirement/fea-0045-url-state-modal-panchangam

I'll guide you through:
1. Brainstorming (design exploration)
2. Design documentation
3. Implementation planning
4. Merging to main

Starting Phase 1: Brainstorming
```

Then invokes the brainstorming skill, which will:
- Ask clarifying questions about the feature
- Propose 2-3 approaches
- Get user approval on design

#### 2. **Create Design Doc**

After brainstorming approval, skill writes:
- `docs/superpowers/specs/2026-06-06-<feature>-design.md` (based on date + feature name)
- Commits to requirement branch with message: "docs: Add design spec for requirement/fea-NNNN"

#### 3. **Plan Implementation**

Invokes writing-plans skill, which creates:
- `docs/superpowers/plans/2026-06-06-<feature>-plan.md`
- Lists tasks in order of execution
- Identifies critical files and test strategy

User reviews plan.

#### 4. **Commit and Merge**

Skill prepares commits:

```bash
# First commit: design doc
git add docs/superpowers/specs/*.md
git commit -m "docs: Add design spec for requirement/fea-NNNN

Design exploration and approval for feature.
See docs/superpowers/specs/ for details."

# Second commit: plan
git add docs/superpowers/plans/*.md
git commit -m "docs: Add implementation plan for requirement/fea-NNNN

Step-by-step implementation strategy.
Ready to hand off to feature-workflow."
```

Then merges to main:
```bash
./scripts/feature-workflow.sh finish
```

---

## After Merge: Feature-Workflow Handoff

Once requirement branch is merged to main:

1. **Create feature branch** for implementation:
   ```bash
   ./scripts/feature-workflow.sh start 0045-url-state-modal-panchangam
   ```

2. **Reference the plan** during implementation:
   ```bash
   # Open the plan file to see step-by-step tasks
   cat docs/superpowers/plans/2026-06-06-url-state-modal-panchangam-plan.md
   ```

3. **Follow feature-workflow** rules:
   - Write tests first (TDD)
   - Commit frequently with task ID: `Fixes #0045`
   - Run tests before each commit
   - Update task status in `tasks/0045-*.md`

4. **Finish feature**:
   ```bash
   ./scripts/feature-workflow.sh test      # All tests pass
   ./scripts/feature-workflow.sh finish    # Merge to main
   ./scripts/push-to-github.sh             # Push
   ```

---

## Key Files Generated

| File | Location | Purpose |
|------|----------|---------|
| Task file | `tasks/NNNN-kebab-case.md` | Created by FEA: prompt (before requirement branch) |
| Design spec | `docs/superpowers/specs/YYYY-MM-DD-feature-design.md` | Design exploration output |
| Implementation plan | `docs/superpowers/plans/YYYY-MM-DD-feature-plan.md` | Step-by-step tasks |
| Feature branch | `feature/NNNN-kebab-case` | For implementation |

---

## Decision Points During Brainstorming

The brainstorming skill may ask you to choose between approaches. Common choices:

1. **Modal vs Inline UI**: Should feature use modal dialog or inline expansion?
2. **Auto vs Manual**: Should calculation trigger automatically or require button click?
3. **URL Params**: What format for shareable links?
4. **Testing Strategy**: Unit tests, E2E tests, or both?

**Your job**: Answer clearly so design is unambiguous. The written spec should leave no room for interpretation.

---

## Troubleshooting

### "Not on a requirement/* branch"

Make sure you created the requirement branch:
```bash
git branch
# Should show: * requirement/fea-NNNN-*
```

If not:
```bash
# Use FEA: prompt to create it
FEA: Your feature description
```

### "Design doc already exists"

If `docs/superpowers/specs/` already has a file from this feature:
- Edit it manually, or
- Delete and regenerate with brainstorming skill, or
- Use different filename (skill auto-timestamps)

### "Writing-plans failed"

The plan might be too complex. Break it into smaller tasks or simplify design.

### "Can't merge requirement branch"

Check for conflicts:
```bash
git status
git diff main..HEAD
```

Resolve conflicts, then retry:
```bash
./scripts/feature-workflow.sh finish
```

---

## Related Skills & Scripts

- **brainstorming** (superpowers plugin): Design exploration
- **writing-plans** (superpowers plugin): Implementation planning
- **feature-workflow.sh**: Create feature branches, run tests, commit, merge
- **FEA:/BUG: prompts**: Quick entry for new requirements

---

## Examples

### Example: Simple Feature

```
User: /requirement-workflow

Skill: Starting brainstorming for modal UI feature...
(brainstorming runs, user approves design)

Skill: Creating design doc...
(writes docs/superpowers/specs/2026-06-06-url-state-modal-design.md)

Skill: Creating implementation plan...
(writing-plans runs, user approves plan)

Skill: Committing to requirement branch...
git commit -m "docs: Add design spec and plan"

Skill: Merging to main...
./scripts/feature-workflow.sh finish

Skill: Ready for feature-workflow!
Next: ./scripts/feature-workflow.sh start 0045-url-state-modal-panchangam
```

### Example: Complex Feature with Multiple Approaches

```
User: /requirement-workflow

Skill: Brainstorming started...

(Skill proposes 3 different architectures)

User: "I prefer Approach B because..."

Skill: Great! Let me refine Approach B...
(follow-up questions)

User: (answers clarifying questions)

Skill: Design approved! Writing spec...
(continues with design doc, plan, merge)
```

---

## Design Philosophy

This skill unifies two previously separate workflows:

1. **Your project's workflow** (requirement/feature branches, task files)
2. **Superpowers plugin workflow** (brainstorming, writing-plans, feature-workflow)

By nesting superpowers skills **inside** your requirement phase, you get:

✅ Design exploration (brainstorming)  
✅ Formal documentation (design spec)  
✅ Implementation planning (writing-plans)  
✅ Traceable history (all in git)  
✅ Team review points (requirement PR, feature PR)  
✅ Clear handoff between phases (main branch gate)

---

## Questions?

This skill is part of your unified development workflow. If you're stuck:

1. Check git branch: `git branch`
2. Verify you're on `requirement/*`
3. Review `CLAUDE.md` for project context
4. Check `.claude/WORKFLOW.md` for golden rules
