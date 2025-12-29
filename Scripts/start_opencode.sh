#!/bin/bash
# Smart OpenCode startup with automatic memory loading

PERSONALOS_DIR="$HOME/PersonalOS"
MEMORY_PROMPT="$PERSONALOS_DIR/Scripts/load_memory.sh"

# Generate today's daily file
echo "📅 Generating today's mission..."
python3 "$PERSONALOS_DIR/Scripts/generate_today.py"

echo ""
echo "🧠 Preparing memory context..."
echo ""

# Generate and display the memory loading prompt
PROMPT=$($MEMORY_PROMPT)

echo "Starting OpenCode with automatic memory loading..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your AI will automatically load context from:"
echo "  • Identity (who Claude is)"
echo "  • Goals (what you're working toward)"
echo "  • Observations (what's working)"
echo "  • Latest episode (where you left off)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Just start typing your request, or press Enter to load memory now."
echo ""

# Start OpenCode with the memory prompt pre-filled
cd "$PERSONALOS_DIR"
opencode --prompt "$PROMPT"
