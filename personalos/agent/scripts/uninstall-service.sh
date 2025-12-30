#!/bin/bash

# PersonalOS Agent Service Uninstaller

PLIST_NAME="com.personalos.agent.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "============================================"
echo "   PersonalOS Agent Service Uninstaller"
echo "============================================"
echo ""

if [ ! -f "$PLIST_DEST" ]; then
    echo "Service not installed."
    exit 0
fi

echo "Stopping service..."
launchctl unload "$PLIST_DEST" 2>/dev/null || true

echo "Removing service file..."
rm -f "$PLIST_DEST"

echo ""
echo "Service uninstalled successfully."
echo ""
