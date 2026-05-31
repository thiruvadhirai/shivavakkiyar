#!/usr/bin/env python3
"""
Find and display JSON files in project .claude and root directories.

Usage:
    PROJECT_ROOT=/path/to/repo python3 findjsonfiles.py

Environment Variables:
    PROJECT_ROOT: Project root directory (default: current directory)
"""

import os
import glob
import sys
from pathlib import Path


def main():
    # Get project root from environment or use current directory
    project_root = os.getenv('PROJECT_ROOT', os.getcwd())

    # Resolve to absolute path
    project_root = Path(project_root).resolve()

    if not project_root.exists():
        print(f"Error: PROJECT_ROOT does not exist: {project_root}", file=sys.stderr)
        sys.exit(1)

    # Find all JSON files
    json_files = []

    # Search in .claude/ subdirectory
    claude_dir = project_root / '.claude'
    if claude_dir.exists():
        json_files.extend(glob.glob(str(claude_dir / '*.json')))

    # Search in root directory
    json_files.extend(glob.glob(str(project_root / '*.json')))

    # Remove duplicates and sort
    json_files = sorted(set(json_files))

    if not json_files:
        print("No JSON files found.", file=sys.stderr)
        sys.exit(0)

    # Display each file
    for file_path in json_files:
        try:
            # Print header with file info
            print(f"=== {file_path} ===")

            # Print first 20 lines
            with open(file_path, 'r') as f:
                for i, line in enumerate(f):
                    if i >= 20:
                        break
                    print(line, end='')

        except (IOError, OSError) as e:
            print(f"Error reading {file_path}: {e}", file=sys.stderr)
            continue


if __name__ == '__main__':
    main()
