#!/bin/bash

# PersonalOS Development Server
# Runs Laravel + Vite with hot reload

set -e

echo "🚀 Starting PersonalOS Development Server..."

# Kill any existing processes on our ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

kill_port 8000
kill_port 5173

# Start Laravel server in background
echo "Starting Laravel server on http://localhost:8000..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Start Vite dev server (enables hot reload)
echo "Starting Vite dev server with hot reload on http://localhost:5173..."
npm run dev &
VITE_PID=$!

# Trap to clean up on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $LARAVEL_PID 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo "✅ Development servers running!"
echo "   Laravel:  http://localhost:8000"
echo "   Vite HMR: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for either process to exit
wait
