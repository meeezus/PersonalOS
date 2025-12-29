#!/bin/bash
# Start PersonalOS Dashboard

PERSONALOS_DIR="$HOME/PersonalOS"
DASHBOARD_DIR="$PERSONALOS_DIR/Dashboard"

echo "🚀 Starting PersonalOS Dashboard..."
echo ""
echo "Dashboard will be available at:"
echo "  Local:  http://localhost:3002"
echo "  Mobile: http://michaels-macbook-pro:3002"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd "$DASHBOARD_DIR"
python3 server.py
