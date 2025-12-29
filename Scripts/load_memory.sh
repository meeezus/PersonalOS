#!/bin/bash
# Auto-generate memory loading prompt for OpenCode

PERSONALOS_DIR="$HOME/PersonalOS"
MEMORY_DIR="$PERSONALOS_DIR/Memory"
EPISODE_DIR="$MEMORY_DIR/episode_logs"

# Find the latest episode log
LATEST_EPISODE=$(ls -t "$EPISODE_DIR"/*.md 2>/dev/null | head -1)

# Generate the LIGHTWEIGHT memory loading prompt
# Only loads identity (who I am) and latest episode (where you left off)
# Skip goals.md and observations.md unless needed
cat << EOF
Read these files for context:
- Memory/identity.md (who I am)
- Memory/episode_logs/$(basename "$LATEST_EPISODE") (where we left off)

Then tell me what we should focus on today.

(If you need goals or observations, just ask me to read those too)
EOF
