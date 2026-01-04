#!/bin/bash
# PersonalOS One-Time Setup
# Run this ONCE after cloning to enable auto-rebuild on pull

set -e

echo "🚀 PersonalOS Setup"
echo "==================="

# Configure git to use custom hooks
git config core.hooksPath .githooks

# Install dependencies
echo "📦 Installing PHP dependencies..."
cd personalos
composer install

echo "📦 Installing Node dependencies..."
npm install

# Setup environment
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
    echo "✅ Created .env file"
fi

# Build frontend
echo "🏗️  Building frontend..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the dev server with hot reload, run:"
echo "  cd personalos && npm run start"
echo ""
echo "Or use the Makefile:"
echo "  make dev"
echo ""
echo "Auto-rebuild is now enabled - every 'git pull' will rebuild automatically."
