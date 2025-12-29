#!/bin/bash
# PersonalOS Week 1 MVP Setup Script

echo "🚀 Setting up your PersonalOS Week 1 MVP..."
echo ""

# Determine shell config file
if [ -f "$HOME/.zshrc" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
else
    echo "⚠️  Could not find .zshrc or .bashrc"
    echo "You'll need to manually add the alias later."
    SHELL_CONFIG=""
fi

# Make the Python script executable
chmod +x ~/PersonalOS/Scripts/generate_today.py

echo "✅ Made generate_today.py executable"

# Add alias to shell config (if found)
if [ -n "$SHELL_CONFIG" ]; then
    # Check if alias already exists
    if grep -q "alias today=" "$SHELL_CONFIG"; then
        echo "ℹ️  'today' alias already exists in $SHELL_CONFIG"
    else
        echo "" >> "$SHELL_CONFIG"
        echo "# PersonalOS Week 1 MVP" >> "$SHELL_CONFIG"
        echo "alias today='python3 ~/PersonalOS/Scripts/generate_today.py'" >> "$SHELL_CONFIG"
        echo "✅ Added 'today' alias to $SHELL_CONFIG"
        echo ""
        echo "⚡ Run this to activate the alias now:"
        echo "   source $SHELL_CONFIG"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Quick Start:"
echo "   1. Run: source $SHELL_CONFIG"
echo "   2. Run: today"
echo "   3. Open: ~/PersonalOS/Tasks/Today.md"
echo ""
echo "💡 Tip: Run 'today' every morning to generate your daily focus file."
echo ""
