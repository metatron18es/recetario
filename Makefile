SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help install db db-stop backend frontend dev stop

LOGS := .logs

# Servicios: nombre|puerto|enlace
SERVICIOS := "Base de datos|5434|postgresql://recetario@localhost:5434/recetario" "API|3001|http://localhost:3001" "App|5174|http://localhost:5174"

# Lanza un servicio en segundo plano salvo que su puerto ya esté ocupado. Uso: $(call lanzar,nombre,puerto,carpeta,comando)
define lanzar
@if (echo > /dev/tcp/127.0.0.1/$(2)) 2>/dev/null; then \
	echo "  · $(1): ya está en marcha (puerto $(2))"; \
else \
	mkdir -p $(LOGS); \
	(cd $(3) && exec setsid nohup $(4)) > $(LOGS)/$(1).log 2>&1 < /dev/null & \
	echo "  ✓ $(1): arrancando (puerto $(2))"; \
fi
endef

help: ## Muestra esta ayuda
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

install: ## Instala las dependencias de backend y frontend
	cd backend && npm install
	cd frontend && npm install

db: ## Levanta PostgreSQL (docker, puerto 5434)
	@if (echo > /dev/tcp/127.0.0.1/5434) 2>/dev/null; then \
		echo "  · Base de datos: ya está en marcha (puerto 5434)"; \
	else \
		(cd backend && docker compose up -d) && echo "  ✓ Base de datos: arrancando (puerto 5434)"; \
	fi

db-stop: ## Para la base de datos
	cd backend && docker compose stop

backend:
	$(call lanzar,API,3001,backend,npm run dev)

frontend:
	$(call lanzar,App,5174,frontend,npm run dev)

dev: ## Lanza base de datos, API y app (lo que ya esté en marcha se salta)
	@echo "Arrancando servicios…"
	@$(MAKE) --no-print-directory db backend frontend
	@echo; echo "Esperando a que respondan…"
	@for s in $(SERVICIOS); do \
		IFS='|' read -r nombre puerto enlace <<< "$$(echo $$s | tr -d '"')"; \
		for i in $$(seq 1 30); do (echo > /dev/tcp/127.0.0.1/$$puerto) 2>/dev/null && break; sleep 1; done; \
		if (echo > /dev/tcp/127.0.0.1/$$puerto) 2>/dev/null; then estado="listo"; else estado="sin respuesta (mira $(LOGS)/)"; fi; \
		printf "  %-14s puerto %-5s %-44s %s\n" "$$nombre" "$$puerto" "$$enlace" "$$estado"; \
	done
	@echo; echo "Logs en $(LOGS)/. Para parar: make stop (API y app) y make db-stop (base de datos)."

stop: ## Para API y app (no toca la base de datos)
	@for p in 3001 5174; do \
		if fuser -k $$p/tcp >/dev/null 2>&1; then echo "  ✓ parado el puerto $$p"; else echo "  · nada en el puerto $$p"; fi; \
	done
