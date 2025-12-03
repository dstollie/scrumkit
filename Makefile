.PHONY: setup dev db-create db-push db-studio build clean help share

# Default postgres config (override with environment variables)
DB_HOST ?= 127.0.0.1
DB_PORT ?= 5432
DB_USER ?= dennisstolmeijer
DB_NAME ?= scrumkit

# Construct DATABASE_URL (no password for local dev)
export POSTGRES_URL = postgres://$(DB_USER)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: db-create db-push ## Full setup: create database and run migrations
	@echo "✅ Setup complete! Run 'make dev' to start the server."

dev: ## Start development server
	bun run dev

db-create: ## Create the database (requires psql)
	@echo "Creating database '$(DB_NAME)'..."
	@createdb $(DB_NAME) 2>/dev/null || echo "Database already exists or couldn't be created"

db-drop: ## Drop the database (DESTRUCTIVE!)
	@echo "⚠️  Dropping database '$(DB_NAME)'..."
	@dropdb $(DB_NAME) 2>/dev/null || echo "Database doesn't exist"

db-push: ## Push schema to database
	@echo "Pushing schema to database..."
	POSTGRES_URL="$(POSTGRES_URL)" bun run db:push

db-generate: ## Generate migration files
	POSTGRES_URL="$(POSTGRES_URL)" bun run db:generate

db-studio: ## Open Drizzle Studio (database GUI)
	POSTGRES_URL="$(POSTGRES_URL)" bun run db:studio

build: ## Build for production
	bun run build

lint: ## Run linter
	bun run lint

clean: ## Clean build artifacts
	rm -rf .next node_modules

install: ## Install dependencies
	bun install

# Quick test command
test-api: ## Test if API is working (requires running server)
	@echo "Testing API..."
	@curl -s http://localhost:3000/api/retrospective | head -c 100 || echo "Server not running?"

# Sharing
share: ## Share local server via ngrok (requires ngrok installed)
	@echo "Starting ngrok tunnel to localhost:3000..."
	@echo "Install ngrok: brew install ngrok"
	@echo ""
	ngrok http 3000
