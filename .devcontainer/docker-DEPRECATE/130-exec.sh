#!/bin/bash

# -----------------------------------------------------------------
#
# Describe the purpose of the script here.
#
# -----------------------------------------------------------------
#
# Execs into a running container.
#  
# -----------------------------------------------------------------

# Check mlkcontext to check. If void, no check will be performed
MATCH_MLKCONTEXT=common
# Container to exec into name
CONTAINER_NAME=appian-dev
# Command to exec
COMMAND="/bin/bash"
# Work dir
WORKDIR=/





# ---

# Check mlkcontext

if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi


if [ -z "${CONTAINER_NAME}" ]; then 

  echo Container name not specified, exiting...
  exit 1
    
fi


if [ ! -z "${WORKDIR}" ] ; then 

  WORKDIR="--workdir ${WORKDIR}"

fi


docker exec -ti \
  $WORKDIR \
  $CONTAINER_NAME \
  $COMMAND

