#!/bin/bash
# Feature Branch Workflow Management
# Usage: ./scripts/feature-workflow.sh <command> [feature-name]
# Commands: start, test, commit, finish

set -e

MAIN_BRANCH="main"
FEATURE_BRANCH=""
VERSION_FILE="VERSION"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# FUNCTIONS
# ============================================================

show_usage() {
  cat << EOF
${BLUE}Feature Branch Workflow Manager${NC}

${YELLOW}Usage:${NC}
  ./scripts/feature-workflow.sh <command> [feature-name]

${YELLOW}Commands:${NC}
  start <name>      - Create and switch to feature/name branch
  status            - Show current branch and version
  test              - Run unit tests
  commit <message>  - Commit changes (auto-increments version via hook)
  list              - List all feature branches
  finish            - Merge feature to main and delete feature branch
  clean             - Delete all feature branches except current

${YELLOW}Workflow Example:${NC}
  ./scripts/feature-workflow.sh start my-feature
  # Make code changes...
  ./scripts/feature-workflow.sh test
  ./scripts/feature-workflow.sh commit "My feature changes"
  ./scripts/feature-workflow.sh test
  ./scripts/feature-workflow.sh finish

${YELLOW}Version Management:${NC}
  • Automatically increments on each commit via git hook
  • Displayed in widget badge and page footer
  • Format: MAJOR.MINOR.PATCH-STAGE.NUM (e.g., 1.0.0-beta.2)

EOF
}

get_current_branch() {
  git rev-parse --abbrev-ref HEAD
}

get_current_version() {
  cat "$VERSION_FILE"
}

# ============================================================
# COMMANDS
# ============================================================

cmd_start() {
  local feature_name="$1"

  if [ -z "$feature_name" ]; then
    echo -e "${RED}Error: Feature name required${NC}"
    echo "Usage: ./scripts/feature-workflow.sh start <feature-name>"
    exit 1
  fi

  local feature_branch="feature/$feature_name"
  local current_branch=$(get_current_branch)

  if [ "$current_branch" != "$MAIN_BRANCH" ]; then
    echo -e "${YELLOW}Warning: Not on main branch. Switching to main first...${NC}"
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH" 2>/dev/null || true
  fi

  if git show-ref --quiet "refs/heads/$feature_branch"; then
    echo -e "${YELLOW}Feature branch already exists. Switching to it...${NC}"
    git checkout "$feature_branch"
  else
    echo -e "${BLUE}Creating feature branch: $feature_branch${NC}"
    git checkout -b "$feature_branch"
  fi

  echo -e "${GREEN}✅ Switched to: $feature_branch${NC}"
  echo -e "   Version: $(get_current_version)"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. Make code changes"
  echo "  2. Run: ./scripts/feature-workflow.sh test"
  echo "  3. Run: ./scripts/feature-workflow.sh commit 'message'"
  echo "  4. Repeat 1-3 as needed"
  echo "  5. Run: ./scripts/feature-workflow.sh finish"
}

cmd_status() {
  local current_branch=$(get_current_branch)
  local current_version=$(get_current_version)

  echo -e "${BLUE}Current Status:${NC}"
  echo "  Branch: $current_branch"
  echo "  Version: $current_version"
  echo ""

  if [[ "$current_branch" == feature/* ]]; then
    echo -e "${GREEN}✅ On feature branch - Ready for development${NC}"
    echo ""
    echo "Changes from main:"
    git diff --stat "$MAIN_BRANCH"...HEAD || echo "  (No differences yet)"
  elif [ "$current_branch" == "$MAIN_BRANCH" ]; then
    echo -e "${GREEN}✅ On main branch - Ready to start a new feature${NC}"
  else
    echo -e "${YELLOW}⚠️  On detached branch: $current_branch${NC}"
  fi
}

cmd_test() {
  echo -e "${BLUE}Running tests in saivamcloud-test container...${NC}"
  echo ""

  if [ ! -f "tests/panchanga-calculator.test.js" ]; then
    echo -e "${RED}Error: Test file not found: tests/panchanga-calculator.test.js${NC}"
    return 1
  fi

  # Start containers if not running
  if ! podman ps --format "{{.Names}}" | grep -q "^saivamcloud-dev$"; then
    echo -e "${YELLOW}Starting dev container...${NC}"
    podman-compose up -d saivamcloud-dev
    sleep 5
  fi

  if ! podman ps --format "{{.Names}}" | grep -q "^saivamcloud-test$"; then
    echo -e "${YELLOW}Starting test container...${NC}"
    podman-compose --profile test up -d saivamcloud-test
    sleep 3
  fi

  # Run tests in container (use podman exec directly since podman-compose has issues with profile)
  if podman exec saivamcloud-test npm test; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    return 0
  else
    echo ""
    echo -e "${RED}❌ Tests failed!${NC}"
    return 1
  fi
}

cmd_commit() {
  local message="$1"

  if [ -z "$message" ]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: ./scripts/feature-workflow.sh commit 'Your message'"
    exit 1
  fi

  local current_branch=$(get_current_branch)
  if [ "$current_branch" == "$MAIN_BRANCH" ]; then
    echo -e "${RED}Error: Cannot commit directly to main branch${NC}"
    echo "Use: ./scripts/feature-workflow.sh start <feature-name>"
    exit 1
  fi

  echo -e "${BLUE}Staging and committing changes...${NC}"

  # Stage all changes
  git add -A

  # Show what will be committed
  echo ""
  echo "Changes to commit:"
  git diff --cached --stat

  echo ""
  echo -e "${BLUE}Committing...${NC}"

  # Commit with message
  git commit -m "$message

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>" || {
    echo -e "${RED}Commit failed${NC}"
    return 1
  }

  # Show new version (incremented by git hook)
  local new_version=$(get_current_version)
  echo ""
  echo -e "${GREEN}✅ Commit successful!${NC}"
  echo "   New version: $new_version"
}

cmd_list() {
  echo -e "${BLUE}Available feature branches:${NC}"
  echo ""

  git branch -a | grep "feature/" || echo "  (No feature branches)"

  echo ""
  echo "Current branch: $(get_current_branch)"
}

cmd_finish() {
  local current_branch=$(get_current_branch)

  if [ "$current_branch" == "$MAIN_BRANCH" ]; then
    echo -e "${RED}Error: Already on main branch${NC}"
    exit 1
  fi

  if [[ "$current_branch" != feature/* ]]; then
    echo -e "${RED}Error: Not on a feature branch${NC}"
    echo "Current branch: $current_branch"
    exit 1
  fi

  echo -e "${BLUE}Finishing feature branch: $current_branch${NC}"
  echo ""

  # Show commits to be merged
  echo "Commits to merge:"
  git log "$MAIN_BRANCH"...HEAD --oneline | sed 's/^/  /'

  echo ""
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    return 1
  fi

  echo ""
  echo -e "${BLUE}Merging to main...${NC}"

  # Switch to main
  git checkout "$MAIN_BRANCH"

  # Merge feature branch
  if git merge "$current_branch" -m "Merge $current_branch into main"; then
    echo -e "${GREEN}✅ Merged successfully${NC}"
  else
    echo -e "${RED}❌ Merge conflict!${NC}"
    echo "Resolve conflicts and run:"
    echo "  git add . && git commit"
    return 1
  fi

  # Delete feature branch
  echo ""
  echo -e "${BLUE}Deleting feature branch: $current_branch${NC}"
  git branch -d "$current_branch"

  echo ""
  echo -e "${GREEN}✅ Feature branch finished and deleted${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Review commits on main"
  echo "  2. Run: git push origin main"
  echo "  3. Start new feature: ./scripts/feature-workflow.sh start <name>"
}

cmd_clean() {
  echo -e "${YELLOW}Deleting all feature branches...${NC}"
  echo ""

  local current_branch=$(get_current_branch)
  local deleted=0

  for branch in $(git branch | grep "feature/"); do
    branch=$(echo "$branch" | xargs) # trim whitespace

    if [ "$branch" != "$current_branch" ]; then
      echo -e "  Deleting: $branch"
      git branch -D "$branch"
      ((deleted++))
    fi
  done

  echo ""
  if [ $deleted -gt 0 ]; then
    echo -e "${GREEN}✅ Deleted $deleted branch(es)${NC}"
  else
    echo -e "${BLUE}No branches to delete${NC}"
  fi
}

# ============================================================
# MAIN
# ============================================================

if [ $# -lt 1 ]; then
  show_usage
  exit 0
fi

COMMAND="$1"
FEATURE_NAME="${2:-}"

case "$COMMAND" in
  start)
    cmd_start "$FEATURE_NAME"
    ;;
  status)
    cmd_status
    ;;
  test)
    cmd_test
    ;;
  commit)
    cmd_commit "$FEATURE_NAME"
    ;;
  list)
    cmd_list
    ;;
  finish)
    cmd_finish
    ;;
  clean)
    cmd_clean
    ;;
  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    echo ""
    show_usage
    exit 1
    ;;
esac
