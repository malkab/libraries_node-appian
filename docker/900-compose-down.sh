#!/bin/bash

# Version: 2020-09-10

# -----------------------------------------------------------------
#
# Stops and drop the compose.
#
# -----------------------------------------------------------------
#
# Downs a compose. With TIMEOUT=0 it is fulminated. Stops and removes
# containers, networks, and volumes, if specified.
#
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed
MATCH_MLKCONTEXT=common
# Stop timeout, in seconds
TIMEOUT=0
# Compose file, blank searches for local docker-compose file
COMPOSE_FILE=./docker-compose.yaml
# Project name, can be blank. Take into account that the folder name will be
# used, there can be name clashes
PROJECT_NAME=$(mlkp app_name)
# Drop volumes
REMOVE_VOLUMES=true





# ---

# Check mlkcontext
if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi

if [ ! -z "${COMPOSE_FILE}" ] ; then

  COMPOSE_FILE="-f ${COMPOSE_FILE}"

fi

if [ ! -z "${PROJECT_NAME}" ] ; then

  PROJECT_NAME="-p ${PROJECT_NAME}"

fi

if [ "$REMOVE_VOLUMES" = true ] ; then

  REMOVE_VOLUMES="-v"

else

  REMOVE_VOLUMES=

fi

docker-compose $COMPOSE_FILE $PROJECT_NAME down -t $TIMEOUT $REMOVE_VOLUMES
