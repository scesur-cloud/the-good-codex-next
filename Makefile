SHELL := /bin/bash

DC := docker compose

# Start all services in detached mode
up:
	$(DC) up -d --build

# Stop all services
down:
	$(DC) down

# Check service status
ps:
	$(DC) ps

# View all logs
logs:
	$(DC) logs -f --tail=200

# View web logs
logs-web:
	$(DC) logs -f --tail=200 web

# View worker logs
logs-worker:
	$(DC) logs -f --tail=200 worker

# Full restart (down + up)
restart:
	$(DC) down && $(DC) up -d --build

# Backup SQLite DB (host volume ./data/prod.db)
backup:
	@mkdir -p backups
	@if [ -f data/prod.db ]; then \
	  cp data/prod.db backups/prod.$$(date +%Y%m%d_%H%M%S).db && \
	  echo "✅ Backup created in backups/ (prod.$$(date +%Y%m%d_%H%M%S).db)"; \
	else \
	  echo "⚠️ No data/prod.db found. Run 'make up' first."; \
	fi

# Restore from a backup: make restore FILE=backups/prod.YYYYMMDD_HHMMSS.db
restore:
	@if [ -z "$(FILE)" ]; then \
	  echo "Usage: make restore FILE=backups/prod.YYYYMMDD_HHMMSS.db"; exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
	  echo "❌ Backup file not found: $(FILE)"; exit 1; \
	fi
	@mkdir -p data
	cp "$(FILE)" data/prod.db
	echo "✅ Restored $(FILE) -> data/prod.db"

# Reset data (moves db to backups then removes data/)
reset:
	@mkdir -p backups
	@if [ -f data/prod.db ]; then \
	  mv data/prod.db backups/prod.reset.$$(date +%Y%m%d_%H%M%S).db; \
	  echo "📦 Existing DB moved to backups/"; \
	fi
	rm -rf data
	echo "✅ Data folder reset."
