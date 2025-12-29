#!/bin/bash
# Start PersonalOS Web App (like JFDI)

PERSONALOS_DIR="$HOME/PersonalOS"

echo "🚀 Starting PersonalOS Web App..."
echo ""
echo "Starting backend services..."

# Kill any existing servers
killall -9 python3 2>/dev/null
sleep 1

# Start dashboard server in background
echo "  📊 Dashboard Server (port 3002)"
cd "$PERSONALOS_DIR/Dashboard"
python3 server.py > /dev/null 2>&1 &
DASHBOARD_PID=$!

# Start OpenCode web server in background
echo "  🤖 Claude Code Chat (port 3001)"
opencode web --port 3001 > /dev/null 2>&1 &
OPENCODE_PID=$!

# Wait for servers to start
sleep 2

# Get Tailscale IP for mobile access
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null)

echo ""
echo "✅ PersonalOS is running!"
echo ""
echo "Access URLs:"
echo "  🖥️  Mac:    http://localhost:3002"
if [ -n "$TAILSCALE_IP" ]; then
    echo "  📱 iPhone: http://$TAILSCALE_IP:3002"
    echo "            (Add to home screen for app-like experience)"
else
    echo "  📱 iPhone: http://$(hostname):3002 (on same WiFi)"
fi
echo ""
echo "Features:"
echo "  • Three Pillars: Tasks, Projects, People"
echo "  • Today's tasks from Unified_Week1_Plan.md"
echo "  • Chat overlay with Claude Code (uses subscription!)"
echo "  • Mobile-first design, works anywhere"
echo ""
echo "Opening in browser..."

# Open in default browser
open "http://localhost:3002"

echo ""
echo "Press Ctrl+C to stop PersonalOS"
echo ""

# Keep script running and wait for Ctrl+C
trap "echo ''; echo 'Stopping PersonalOS...'; kill $DASHBOARD_PID $OPENCODE_PID 2>/dev/null; echo '✅ PersonalOS stopped'; exit 0" INT

# Wait forever
wait
