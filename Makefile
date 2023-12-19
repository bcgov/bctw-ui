#!make

# ------------------------------------------------------------------------------
# Makefile -- BCTW
# ------------------------------------------------------------------------------

-include .env

# Apply the contents of the .env to the terminal, so that the docker-compose file can use them in its builds
export $(shell sed 's/=.*//' .env)

## ------------------------------------------------------------------------------
## Alias Commands
## - Performs logical groups of commands for your convenience
## ------------------------------------------------------------------------------

web: close build-web run-web


## ------------------------------------------------------------------------------
## Setup/Cleanup Commands
## ------------------------------------------------------------------------------

env: ## Prepares the environment variables used by all project docker containers
	@echo "==============================================="
	@echo "Make: setup - copying env.docker to .env"
	@echo "==============================================="
	@cp -i env.docker .env

close: ## Closes all project containers
	@echo "==============================================="
	@echo "Make: close - closing Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down

clean: ## Closes and cleans (removes) all project containers
	@echo "==============================================="
	@echo "Make: clean - closing and cleaning Docker containers"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans

prune: ## Deletes ALL docker artifacts (even those not associated to this project)
	@echo -n "Delete ALL docker artifacts? [y/n] " && read ans && [ $${ans:-n} = y ]
	@echo "==============================================="
	@echo "Make: prune - deleting all docker artifacts"
	@echo "==============================================="
	@docker system prune --all --volumes -f
	@docker volume prune --all -f


## ------------------------------------------------------------------------------
## Build/Run Backend+Web Commands (backend + web frontend)
## - Builds all of the BCTW backend+web projects (app, api, proxy)
## ------------------------------------------------------------------------------

build-web: ## Builds all backend+web containers
	@echo "==============================================="
	@echo "Make: build-web - building web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml build api proxy app

run-web: ## Runs all backend+web containers
	@echo "==============================================="
	@echo "Make: run-web - running web images"
	@echo "==============================================="
	@docker-compose -f docker-compose.yml up -d api proxy app
