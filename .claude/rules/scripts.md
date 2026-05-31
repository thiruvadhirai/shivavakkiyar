# Script Development Rules

**Applies to**: All files in `scripts/**` directory

---

## Python-First Mandate

### Rule: All new CLI scripts MUST be Python

- ✅ **MUST**: `.py` extension for all new scripts
- ❌ **WRONG**: Shell scripts (`.sh`) for new functionality
- 🆘 **Exception**: Only if shell language is unavoidable (rare)
  - Example exception: Complex heredocs with multiple expansions
  - If using exception, document reason in file header comment

### Rationale

- **Portability**: Python works identically across macOS, Linux, Windows
- **Maintainability**: Better error handling, clearer logic flow
- **Testing**: Easier to unit test Python code
- **Dependencies**: Avoid shell complexities (quoting, escaping, pipes)

---

## Environment Variable Support

### Rule: No hardcoded paths in scripts

✅ **CORRECT**:
```python
import os

PROJECT_ROOT = os.getenv('PROJECT_ROOT', os.getcwd())
config_path = os.path.join(PROJECT_ROOT, '.claude', 'config.json')
```

❌ **WRONG**:
```python
config_path = '/home/jsnadmin/apps/shivavakkiyar/.claude/config.json'
```

### Why

- Scripts must work from any installation location
- CI/CD systems use different paths
- Team members may clone to different directories
- Containers use different filesystem layouts

### Implementation

1. Accept `PROJECT_ROOT` from environment
2. Fallback to `os.getcwd()` if not set
3. Resolve to absolute path: `Path(project_root).resolve()`
4. Verify path exists before proceeding

---

## Execution Environment

### Rule: Scripts run in containers, never on host

- ✅ `podman exec saivamcloud-test python3 scripts/foo.py`
- ✅ `PROJECT_ROOT=$(pwd) python3 scripts/foo.py` (in container)
- ❌ `python3 scripts/foo.py` (on host, blocked by permissions)

### Permissions

Execution permitted via:
- `.claude/settings.json` allowlist: `Bash(python3 *)`
- Feature workflow automation: `./scripts/feature-workflow.py *`
- Container isolation: `podman exec <container> python3 ...`

---

## Script Development Checklist

Before committing a new script:

- [ ] Language is Python (3.7+) unless exception documented
- [ ] Uses `PROJECT_ROOT` environment variable (not hardcoded paths)
- [ ] Has shebang: `#!/usr/bin/env python3`
- [ ] Is executable: `chmod +x scripts/my-script.py`
- [ ] Tested with `PROJECT_ROOT` set explicitly
- [ ] Tested with `PROJECT_ROOT` unset (fallback to cwd)
- [ ] Has docstring explaining usage
- [ ] Error messages go to stderr
- [ ] Exit codes: 0 = success, non-zero = failure

---

## Examples

### Good Script Template

```python
#!/usr/bin/env python3
"""Brief description of what this script does.

Usage:
    PROJECT_ROOT=/path/to/repo python3 my-script.py [options]

Environment Variables:
    PROJECT_ROOT: Project root (default: current directory)
"""

import os
import sys
from pathlib import Path


def main():
    # Get project root
    project_root = os.getenv('PROJECT_ROOT', os.getcwd())
    project_root = Path(project_root).resolve()

    if not project_root.exists():
        print(f"Error: PROJECT_ROOT not found: {project_root}", file=sys.stderr)
        sys.exit(1)

    # Your logic here
    config_file = project_root / '.claude' / 'config.json'
    # ... use config_file


if __name__ == '__main__':
    main()
```

---

## When to Break This Rule

Rare exceptions where shell is necessary:

| Scenario | Reason | Document As |
|----------|--------|-------------|
| Complex heredocs with nested expansion | Shell syntax unavoidable | Comment: "Shell required for heredoc complexity" |
| Direct shell API (system-specific) | No Python equivalent | Comment: "Shell-specific API: [reason]" |
| Tool piping is clearer in shell | Readability preference | Comment: "Pipe chain clearer in shell" |

**Important**: Even in shell exceptions, still use `PROJECT_ROOT` environment variable.

---

## Related Files

- `.claude/settings.json` - Permissions for Python execution
- `.claude/rules/general.md` - Overall development rules
- `CLAUDE.md` - Master project documentation
