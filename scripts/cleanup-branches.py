#!/usr/bin/env python3
"""Clean up git branches while preserving main and active worktree branches.

Usage:
    PROJECT_ROOT=/path/to/repo python3 cleanup-branches.py [options]

Options:
    --dry-run           Show what would be deleted without deleting
    --force             Use -D instead of -d (force delete)
    --remote            Also clean remote-tracking branches
    --keep BRANCH       Keep additional branches (can use multiple times)

Environment Variables:
    PROJECT_ROOT: Project root (default: current directory)

Examples:
    # Dry run to see what would be deleted
    ./scripts/cleanup-branches.py --dry-run

    # Delete all except main
    ./scripts/cleanup-branches.py

    # Keep feature/in-progress and feature/staging too
    ./scripts/cleanup-branches.py --keep feature/in-progress --keep feature/staging

    # Also clean remote-tracking branches
    ./scripts/cleanup-branches.py --remote
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(cmd, capture=False):
    """Run a shell command and return output."""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=True)
            return None
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed: {cmd}", file=sys.stderr)
        if e.stderr:
            print(f"  {e.stderr}", file=sys.stderr)
        sys.exit(1)


def get_current_branch():
    """Get the currently checked out branch."""
    return run_command("git rev-parse --abbrev-ref HEAD", capture=True)


def get_local_branches():
    """Get list of all local branches."""
    output = run_command("git branch --list", capture=True)
    if not output:
        return []
    # Remove * from current branch and strip whitespace
    branches = [line.strip().lstrip('* ') for line in output.split('\n') if line.strip()]
    return branches


def get_remote_tracking_branches():
    """Get list of remote-tracking branches that no longer exist on remote."""
    output = run_command("git branch -r", capture=True)
    if not output:
        return []
    return [line.strip() for line in output.split('\n') if line.strip()]


def get_worktree_branches():
    """Get list of branches used by worktrees."""
    try:
        output = run_command("git worktree list --porcelain", capture=True)
        branches = []
        for line in output.split('\n'):
            if line.startswith('branch '):
                # Extract branch reference from format: branch refs/heads/feature/wt-NNNN-name
                branch_ref = line.replace('branch ', '').strip()
                if branch_ref.startswith('refs/heads/'):
                    branches.append(branch_ref.replace('refs/heads/', ''))
        return branches
    except subprocess.CalledProcessError:
        return []


def main():
    # Parse arguments
    dry_run = '--dry-run' in sys.argv
    force_delete = '--force' in sys.argv
    clean_remote = '--remote' in sys.argv
    keep_branches = set()

    # Parse --keep arguments
    i = 0
    while i < len(sys.argv):
        if sys.argv[i] == '--keep' and i + 1 < len(sys.argv):
            keep_branches.add(sys.argv[i + 1])
            i += 2
        else:
            i += 1

    # Set up project root
    project_root = os.getenv('PROJECT_ROOT', os.getcwd())
    project_root = Path(project_root).resolve()

    if not project_root.exists():
        print(f"Error: PROJECT_ROOT not found: {project_root}", file=sys.stderr)
        sys.exit(1)

    # Change to project directory
    os.chdir(project_root)

    # Verify we're in a git repo
    if not (project_root / '.git').exists():
        print(f"Error: Not a git repository: {project_root}", file=sys.stderr)
        sys.exit(1)

    current_branch = get_current_branch()
    print(f"Current branch: {current_branch}")

    # Always keep main and current branch
    protected_branches = {'main', current_branch}
    protected_branches.update(keep_branches)

    # Get branches to clean
    if clean_remote:
        print("\nCleaning remote-tracking branches...")
        # Get remote-tracking branches to delete (those from deleted remote branches)
        # This is a simple approach - delete remotes/origin/* that aren't main or current
        remote_branches = get_remote_tracking_branches()
        to_delete_remote = [
            b for b in remote_branches
            if not any(keep in b for keep in protected_branches)
            and 'origin/HEAD' not in b
        ]

        if to_delete_remote:
            for branch in to_delete_remote:
                if dry_run:
                    print(f"  [DRY RUN] Would delete remote-tracking: {branch}")
                else:
                    print(f"  Deleting remote-tracking: {branch}")
                    run_command(f"git branch -dr {branch}")

    # Get local branches to clean
    print("\nCleaning local branches...")
    local_branches = get_local_branches()
    worktree_branches = get_worktree_branches()

    to_delete = [
        b for b in local_branches
        if b not in protected_branches and b not in worktree_branches
    ]

    if not to_delete:
        print("  No branches to delete.")
        return 0

    # Show what we'll delete
    delete_flag = '-D' if force_delete else '-d'

    for branch in to_delete:
        if dry_run:
            print(f"  [DRY RUN] Would delete: {branch}")
        else:
            print(f"  Deleting: {branch}")
            run_command(f"git branch {delete_flag} {branch}")

    if dry_run:
        print(f"\n[DRY RUN] Would delete {len(to_delete)} branch(es)")
        print("Run without --dry-run to actually delete.")
    else:
        print(f"\nDeleted {len(to_delete)} branch(es)")

    # Show protected branches
    if protected_branches:
        print(f"\nProtected branches: {', '.join(sorted(protected_branches))}")
    if worktree_branches:
        print(f"Worktree branches (protected): {', '.join(sorted(worktree_branches))}")

    return 0


if __name__ == '__main__':
    sys.exit(main())
