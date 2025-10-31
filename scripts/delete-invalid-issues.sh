#!/bin/bash

# Script to delete issues with label "invalid"
# Usage: ./scripts/delete-invalid-issues.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "Running in DRY RUN mode - no issues will be deleted"
  echo ""
fi

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repository: $REPO"
echo ""

# Get closed issues with label "wontfix"
echo "Fetching issues with label 'invalid'..."
ISSUES=$(gh issue list --repo "$REPO" --label "invalid" --json number,title --jq '.[] | "\(.number)|\(.title)"')

if [[ -z "$ISSUES" ]]; then
  echo "No issues with label 'invalid' found."
  exit 0
fi

# Count issues
ISSUE_COUNT=$(echo "$ISSUES" | wc -l | tr -d ' ')
echo "Found $ISSUE_COUNT issue(s) to delete:"
echo ""

# Display issues
echo "$ISSUES" | while IFS='|' read -r NUMBER TITLE; do
  echo "  #$NUMBER: $TITLE"
done
echo ""

# Confirm deletion (unless dry run)
if [[ "$DRY_RUN" == false ]]; then
  read -p "Are you sure you want to delete these $ISSUE_COUNT issue(s)? (yes/no): " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo "Aborted."
    exit 0
  fi
  echo ""
fi

# Delete issues
echo "$ISSUES" | while IFS='|' read -r NUMBER TITLE; do
  if [[ "$DRY_RUN" == true ]]; then
    echo "[DRY RUN] Would delete issue #$NUMBER: $TITLE"
  else
    echo "Deleting issue #$NUMBER: $TITLE"
    gh issue delete "$NUMBER" --repo "$REPO" --yes
  fi
done

echo ""
if [[ "$DRY_RUN" == true ]]; then
  echo "DRY RUN complete. Run without --dry-run to actually delete issues."
else
  echo "Successfully deleted $ISSUE_COUNT issue(s)."
fi
