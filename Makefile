# Configuración.
BASE_NAME = appian
SRC_FOLDER = $(shell pwd)/src
DOCKER_VOLUMES_FOLDER = $(shell pwd)/000_docker_volumes

# Ejecuta un script Yarn.
yarn:
	@docker exec -ti \
		--workdir $(shell pwd) \
		$(BASE_NAME)_typescript \
		yarn dev

# Sesión en el devcontainer principal TypeScript.
typescript_sesion:
	@docker exec -ti \
		--workdir $(shell pwd) \
		$(BASE_NAME)_python \
		/bin/bash

# Limpia activos.
clean:
	@read -p "¿Eliminar infraestructura Docker [s/N]? " confirm && \
	if [ "$$confirm" = "s" ]; then \
		docker ps --filter name=$(BASE_NAME)* -q | xargs -r docker stop -t0; \
		docker ps -a --filter name=$(BASE_NAME)* -q | xargs -r docker rm; \
		docker image ls --filter reference=*$(BASE_NAME)* -q | xargs -r docker image rm; \
		docker network ls --filter name=$(BASE_NAME) -q | xargs -r docker network rm; \
	fi