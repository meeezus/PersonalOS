# PersonalOS Makefile
# Quick commands for development

.PHONY: dev start build install iori all stop

# Main development command - starts everything
dev:
	@echo "Starting PersonalOS development environment..."
	@cd personalos && npm run start

# Build production assets
build:
	@echo "Building production assets..."
	@cd personalos && npm run build

# Install all dependencies
install:
	@echo "Installing PHP dependencies..."
	@cd personalos && composer install
	@echo "Installing Node dependencies..."
	@cd personalos && npm install
	@echo "Installing Iori agent dependencies..."
	@cd agent && npm install

# Start Iori agent server
iori:
	@echo "Starting Iori agent server on port 3001..."
	@cd agent && npm run dev

# Start everything (Laravel + Vite + Iori)
all:
	@echo "Starting all services..."
	@cd personalos && concurrently --kill-others \
		"npm run serve" \
		"npm run dev" \
		"cd ../agent && npm run dev"

# Show help
help:
	@echo "PersonalOS Development Commands:"
	@echo "  make dev     - Start Laravel + Vite (with hot reload)"
	@echo "  make build   - Build production assets"
	@echo "  make install - Install all dependencies"
	@echo "  make iori    - Start Iori agent server"
	@echo "  make all     - Start all services (Laravel + Vite + Iori)"
