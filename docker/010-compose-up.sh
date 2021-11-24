#!/bin/bash

# Version 2021-06-13

# -----------------------------------------------------------------
#
# Fire up the supporting DB and Redis.
#
# -----------------------------------------------------------------
#
# Starts a Docker Compose.
#
# -----------------------------------------------------------------
# Check mlkctxt to check. If void, no check will be performed. If NOTNULL,
# any activated context will do, but will fail if no context was activated.
MATCH_MLKCTXT=NOTNULL
# Compose file, defaults to ".".
COMPOSE_FILE=
# Project name, can be blank. Take into account that the folder name
# will be used, there can be name clashes. Defaults to empty.
PROJECT_NAME=$(mlkp app_name)
# Detach. Defaults to "true".
DETACH=false





# ---

# Check mlkctxt is present at the system
if command -v mlkctxt &> /dev/null ; then

  if ! mlkctxt -c $MATCH_MLKCTXT ; then exit 1 ; fi

fi

COMPOSE_FILE_F=
if [ ! -z "${COMPOSE_FILE}" ] ; then

  COMPOSE_FILE_F="-f ${COMPOSE_FILE}"

fi

PROJECT_NAME_F=
if [ ! -z "${PROJECT_NAME}" ] ; then PROJECT_NAME_F="-p ${PROJECT_NAME}" ; fi

# Detach
DETACH_F="-d"
if [ "$DETACH" = false ] ; then DETACH= ; fi

eval docker-compose $COMPOSE_FILE_F $PROJECT_NAME_F up $DETACH_F
