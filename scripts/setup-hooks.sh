#!/bin/bash
# Setup Git Hooks - Idempotent installation of pre-commit hook
# Run this once after cloning the repository
# Safe to run multiple times (won't reinstall if already up-to-date)

set -e

HOOKS_SOURCE_DIR="scripts/hooks"
GIT_HOOKS_DIR=".git/hooks"
HOOK_NAME="pre-commit"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up git hooks...${NC}"
echo ""

# Check if source hook file exists
if [ ! -f "$HOOKS_SOURCE_DIR/$HOOK_NAME" ]; then
  echo -e "${YELLOW}⚠️  Source hook not found: $HOOKS_SOURCE_DIR/$HOOK_NAME${NC}"
  echo "Skipping hook installation."
  exit 0
fi

# Check if .git/hooks directory exists
if [ ! -d "$GIT_HOOKS_DIR" ]; then
  echo -e "${YELLOW}⚠️  Git hooks directory not found: $GIT_HOOKS_DIR${NC}"
  echo "This may not be a git repository."
  exit 1
fi

# Install or update hook
if [ -f "$GIT_HOOKS_DIR/$HOOK_NAME" ]; then
  # Check if hook is up-to-date
  if diff -q "$HOOKS_SOURCE_DIR/$HOOK_NAME" "$GIT_HOOKS_DIR/$HOOK_NAME" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $HOOK_NAME hook is already up-to-date${NC}"
    exit 0
  else
    echo -e "${YELLOW}Updating $HOOK_NAME hook...${NC}"
  fi
else
  echo -e "${BLUE}Installing $HOOK_NAME hook...${NC}"
fi

# Copy hook file
cp "$HOOKS_SOURCE_DIR/$HOOK_NAME" "$GIT_HOOKS_DIR/$HOOK_NAME"

# Make executable
chmod +x "$GIT_HOOKS_DIR/$HOOK_NAME"

echo -e "${GREEN}✅ Git hooks installed successfully${NC}"
echo ""
echo "Installed hooks:"
echo "  - $HOOK_NAME: Version increment + task ID validation"
echo ""
echo "Next: Use ./scripts/feature-workflow.sh for all git operations"
