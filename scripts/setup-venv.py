#!/usr/bin/env python3
"""
Setup Python virtual environment for the project

This script creates a venv and installs project dependencies.
Safe to run multiple times - won't recreate if venv already exists.

Usage:
    python3 scripts/setup-venv.py
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Create and setup virtual environment."""
    # Get project root from environment or derive from script location
    project_dir = Path(os.getenv('PROJECT_ROOT', Path(__file__).parent.parent))
    venv_dir = project_dir / "venv"

    print(f"Project directory: {project_dir}")
    print(f"Virtual environment: {venv_dir}")
    print()

    # Check if venv already exists
    if venv_dir.exists():
        print("✅ Virtual environment already exists")
        print(f"   Location: {venv_dir}")
        print()
        print("To activate it:")
        print(f"   source {venv_dir}/bin/activate")
        return 0

    # Create venv
    print("Creating virtual environment...")
    try:
        subprocess.run(
            [sys.executable, "-m", "venv", str(venv_dir)],
            check=True
        )
        print("✅ Virtual environment created")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create venv: {e}")
        return 1

    # Install requirements if they exist
    requirements_file = project_dir / "requirements.txt"
    if requirements_file.exists():
        print()
        print("Installing dependencies...")
        pip = venv_dir / "bin" / "pip"
        try:
            subprocess.run(
                [str(pip), "install", "-r", str(requirements_file)],
                check=True
            )
            print("✅ Dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Warning: Failed to install dependencies: {e}")
            # Don't fail here, venv is still usable

    print()
    print("✅ Setup complete!")
    print()
    print("To activate the virtual environment:")
    print(f"   source {venv_dir}/bin/activate")
    print()
    print("To deactivate:")
    print("   deactivate")
    print()

    return 0

if __name__ == "__main__":
    sys.exit(main())
