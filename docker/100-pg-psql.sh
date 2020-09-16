#!/bin/bash

# -----------------------------------------------------------------
#
# Document here the purpose of the script
#
# -----------------------------------------------------------------
#
# Creates a volatile PostGIS container to either create an interactive
# psql session or run a SQL script with the same client.
#
# -----------------------------------------------------------------

# Check mlk-context to check. If void, no check will be performed
MATCH_MLKCONTEXT=common
# The network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost"
NETWORK=$MLKC_APP_NAME
# Null for an interactive psql session, use -f for launching files or -c
# for commands. Files must be relative to the mount point SRC_FOLDER
SCRIPT_NAME=
# Container name
CONTAINER_NAME=
# Container host name
CONTAINER_HOST_NAME=
# The version of Docker PG image to use
POSTGIS_DOCKER_TAG=$MLKC_POSTGIS_IMAGE
# The host
HOST=postgis
# The port
PORT=5432
# The user
USER=postgres
# The pass
PASS=postgres
# The DB
DB=postgres
# Source folder to mount on /ext-src/.
# A local folder with $(pwd) or a system-wide volume
SRC_FOLDER=$(pwd)/../node





# ---

# Check mlkcontext

if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi


# Command string

if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi

if [ ! -z "${CONTAINER_NAME}" ]; then CONTAINER_NAME="--name=${CONTAINER_NAME}" ; fi

if [ ! -z "${CONTAINER_HOST_NAME}" ]; then CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}" ; fi

if [ ! -z "${SRC_FOLDER}" ]; then SRC_FOLDER="-v ${SRC_FOLDER}:/ext-src/" ; fi

if [ ! -z "${SCRIPT_NAME}" ]; then SCRIPT_NAME="-f ${SCRIPT_NAME}" ; fi

eval    docker run -ti --rm \
            $NETWORK \
            $CONTAINER_NAME \
            $CONTAINER_HOST_NAME \
            $SRC_FOLDER \
            --entrypoint /bin/bash \
            --workdir /ext-src/ \
            malkab/postgis:$POSTGIS_DOCKER_TAG \
            -c "\"PGPASSWORD=${PASS} psql -h ${HOST} -p ${PORT} -U ${USER} ${DB} ${SCRIPT_NAME}\""
