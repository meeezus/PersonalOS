#!/bin/bash

# PersonalOS Agent Service Installer
# Installs the agent as a macOS launchd service

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AGENT_DIR="$(dirname "$SCRIPT_DIR")"
PLIST_NAME="com.personalos.agent.plist"
PLIST_SOURCE="$SCRIPT_DIR/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"
LOG_DIR="$AGENT_DIR/logs"

echo "============================================"
echo "   PersonalOS Agent Service Installer"
echo "============================================"
echo ""

# Check if running from correct directory
if [ ! -f "$PLIST_SOURCE" ]; then
    echo "Error: $PLIST_NAME not found in $SCRIPT_DIR"
    exit 1
fi

# Create logs directory
echo "Creating logs directory..."
mkdir -p "$LOG_DIR"

# Build TypeScript
echo "Building TypeScript..."
cd "$AGENT_DIR"
npm run build

# Update plist with correct paths
echo "Configuring service..."
NODE_PATH=$(which node)
sed -i '' "s|/usr/local/bin/node|$NODE_PATH|g" "$PLIST_SOURCE"
sed -i '' "s|/Users/michaelenriquez|$HOME|g" "$PLIST_SOURCE"

# Stop existing service if running
if launchctl list | grep -q "com.personalos.agent"; then
    echo "Stopping existing service..."
    launchctl unload "$PLIST_DEST" 2>/dev/null || true
fi

# Copy plist to LaunchAgents
echo "Installing service..."
cp "$PLIST_SOURCE" "$PLIST_DEST"

# Load the service
echo "Starting service..."
launchctl load "$PLIST_DEST"

echo ""
echo "============================================"
echo "   Installation Complete!"
echo "============================================"
echo ""
echo "Service installed as: $PLIST_NAME"
echo "Logs: $LOG_DIR/agent.log"
echo ""
echo "Commands:"
echo "  Check status:  launchctl list | grep personalos"
echo "  View logs:     tail -f $LOG_DIR/agent.log"
echo "  Stop service:  launchctl unload $PLIST_DEST"
echo "  Start service: launchctl load $PLIST_DEST"
echo ""
