.PHONY: help build up down restart rebuild-frontend rebuild-backend logs logs-f migrate test-up test test-down clean

help:
	@echo "Available commands:"
	@echo "  make build            - Build all docker images"
	@echo "  make up               - Start all services"
	@echo "  make down             - Stop all services"
	@echo "  make restart          - Restart all services"
	@echo "  make rebuild          - Rebuild and restart frontend and backend"
	@echo "  make rebuild-frontend - Rebuild and restart frontend with fresh dependencies"
	@echo "  make rebuild-backend  - Rebuild and restart backend with fresh dependencies"
	@echo "  make logs             - View logs from all services"
	@echo "  make logs-f           - Follow logs from all services"
	@echo "  make migrate          - Run database migrations"
	@echo "  make install          - Re-install dependencies"
	@echo "  make test-up          - Build test environment"
	@echo "  make test             - Run tests"
	@echo "  make test-down        - Stop test environment"
	@echo "  make clean            - Remove all containers, images, and volumes"

# Build images
build:
	docker-compose -f docker-compose.dev.yml build

# Start services
up:
	docker-compose -f docker-compose.dev.yml up -d

# Stop services
down:
	docker-compose -f docker-compose.dev.yml down

# Restart services
restart: down up

# Rebuild frontend (will restart with fresh dependencies)
rebuild-frontend:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml build frontend
	docker-compose -f docker-compose.dev.yml up -d

# Rebuild backend (will restart with fresh dependencies)
rebuild-backend:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml build backend
	docker-compose -f docker-compose.dev.yml up -d

# Rebuild frontend and backend
rebuild: rebuild-frontend rebuild-backend

# View logs
logs:
	docker-compose -f docker-compose.dev.yml logs

# Follow logs
logs-f:
	docker-compose -f docker-compose.dev.yml logs -f

# Run DB migrations
migrate:
	docker-compose -f docker-compose.dev.yml exec backend bun run migrate

# Test setup
test-up:
	docker-compose -f docker-compose.test.yml --env-file .env.test -p test up -d

# Run tests
test:
	docker-compose -f docker-compose.test.yml --env-file .env.test -p test exec backend bun --no-env-file test

# Test teardown
test-down:
	docker-compose -f docker-compose.test.yml -p test down

# Delete all containers, images, and volumes
clean:
	@echo "Are you sure you want to delete all containers, images, and volumes? [y/N] "
	@read -p "" confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans; \
		docker-compose -f docker-compose.test.yml -p test down -v --rmi all --remove-orphans; \
		docker rm -f $$(docker ps -aq) 2>/dev/null || true; \
		docker rmi -f $$(docker images -q) 2>/dev/null || true; \
		docker system prune -af --volumes; \
		echo "Cleanup completed successfully."; \
	else \
		echo "Cleanup cancelled."; \
	fi
