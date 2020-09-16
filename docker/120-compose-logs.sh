#!/bin/bash

# -----------------------------------------------------------------
#
# Describe the purpose of the script here.
#
# -----------------------------------------------------------------
#
# Logs a Compose. Allows for an argument to pass as a grep
# command parameter.
#  
# -----------------------------------------------------------------

# Check mlk-context to check. If void, no check will be performed
MATCH_MLKCONTEXT=common
# Will grep lines to this term. If void, all lines will be shown
GREP=$1
# Project name
PROJECT_NAME=$MLKC_APP_NAME
# Follow
FOLLOW=true
# Timestamps
TIMESTAMPS=true
# Tail
TAIL=





# ---

# Check mlkcontext

if [ ! -z "${MATCH_MLKCONTEXT}" ] ; then

  if [ ! "$(mlkcontext)" = "$MATCH_MLKCONTEXT" ] ; then

    echo Please initialise context $MATCH_MLKCONTEXT

    exit 1

  fi

fi


if [ "$TIMESTAMPS" = true ] ; then

  TIMESTAMPS="-t"

else

  TIMESTAMPS=

fi


if [ "$FOLLOW" = true ] ; then

  FOLLOW="-f"

else

  FOLLOW=

fi


if [ ! -z "${PROJECT_NAME}" ] ; then

  PROJECT_NAME="-p ${PROJECT_NAME}"
  
fi


if [ ! -z "${TAIL}" ] ; then

  TAIL="--tail ${TAIL}"
  
else

  TAIL=

fi

if [ ! -z "${GREP}" ] ; then

  FGREP="|grep ${GREP}"

else

  FGREP=""

fi


eval  docker-compose \
        $PROJECT_NAME \
        logs \
        $TIMESTAMPS \
        $FOLLOW \
        $TAIL \
        $FGREP
