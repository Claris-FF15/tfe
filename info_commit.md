# Commit Message Syntax Guide

All commits must follow this format:

1. **Start with `feat:` or `fix:`**
   - `feat:` → for a new feature
   - `fix:`  → for a bug fix

2. **End with `refs: Ticket-<number>`**
   - The number corresponds to the related ticket

3. **Valid examples:**

feat: add login page
refs: Ticket-123

fix: fix display bug
refs: Ticket-456

```
#!/bin/bash
# .git/hooks/commit-msg
# Git hook to validate commit messages

# Read the commit message and remove any CR characters
commit_msg=$(tr -d '\r' < "$1")

# Check the prefix of the first line
first_line=$(echo "$commit_msg" | head -n1)
if [[ ! "$first_line" =~ ^(feat|fix): ]]; then
  echo "❌ Commit must start with 'feat:' or 'fix:'"
  exit 1
fi

# Check that the last line contains refs: Ticket-N
last_line=$(echo "$commit_msg" | tail -n1)
if [[ ! "$last_line" =~ ^refs:[[:space:]]Ticket-[0-9]+$ ]]; then
  echo "❌ Commit must end with 'refs: Ticket-N'"
  exit 1
fi

exit 0
```