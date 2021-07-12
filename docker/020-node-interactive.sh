#!/bin/bash

# Version: 2021-06-12

# -----------------------------------------------------------------
#
# Runs an interactive Node session to develop in Node.js.
#
# -----------------------------------------------------------------
#
# Runs Node environment. Good for interactive use for data science or Node /
# Express programs, and also for Angular frontend development.
#
# -----------------------------------------------------------------
# Check mlkctxt to check. If void, no check will be performed. If NOTNULL,
# any activated context will do, but will fail if no context was activated.
MATCH_MLKCTXT=common
# User UID and GID in the UID:GID form. Defaults to 0:0. This uses the --user
# Docker parameter in case an user is already defined at the image.
USER=1000:1000
# Custom command or path to script (relative to WORKDIR) to execute, for example
# "/bin/bash -c \"ls -lh\"". Leave blank for using the image's built-in option.
# This has a strong interaction with the ENTRYPOINT parameter.
COMMAND=
# Node image version. Defaults to "latest".
NODE_VERSION=12.16.3
# Env mode: production / development. Defaults to "development".
NODE_ENV=
# Node memory. Defaults to "2GB".
NODE_MEMORY=
# The network to connect to. Remember that when attaching to the network of an
# existing container (using container:name) the HOST is "localhost". Also the
# host network can be connected using just "host".
NETWORK=$MLKC_APP_NAME
# Container identifier root. This is used for both the container name (adding an
# UID to avoid clashing) and the container host name (without UID). Incompatible
# with NETWORK container:name option. If blank, a Docker engine default name
# will be assigned to the container.
ID_ROOT=appian_dev
# Unique? If true, no container with the same name can be created. Defaults to
# true.
UNIQUE=
# Work dir. Use $(pwd) paths. Defaults to /.
WORKDIR=$(pwd)/../node/
# Run mode. Can be PERSISTABLE (-ti), VOLATILE (-ti --rm), or DAEMON (-d). If
# blank, defaults to VOLATILE.
RUN_MODE=
# A set of volumes in the form ("source:destination" "source:destination"). Most
# of the times the src folder of the Node source code base is replicated inside
# the container with the same path so build systems works as expected (see
# second line as example). Also this tend to be the WORKDIR As default, the user
# local .npmrc is also included as a volume, so login permissions to private
# repos are shared with the container.
# The first node folder keeps the .git out, so yarn publish tries not to set a
# Git tag. If other folders in the path are needed, the second mounts into the
# container a far broader folder selection, but .git will be visible to yarn and
# it will be asking for Git details when publishing. To avoid that, use yarn
# publish --no-git-tag-version.
VOLUMES=(
  $(pwd)/../node/:$(pwd)/../node/
  $(pwd)/../test_data/:/test_data
  $(pwd)/data/:/data
  $(pwd)/logs:/logs
  ~/.npmrc:/root/.npmrc
  ~/.npmrc:/home/node/.npmrc
  $(pwd)/../test_files_for_downloading/:/test_files_for_downloading/:ro
)
# Env vars. Use ENV_VAR_NAME_CONTAINER=ENV_VAR_NAME_HOST format. Defaults to ().
ENV_VARS=
# Open ports in the form (external:internal external:internal). Ports 9229 and
# 9329 are typically container-level assigned port for remote debuggers. Port
# 8080 is typically assigned at container-level to an Express app entrypoint.
# Angular applications traditionally export port 4200. 8888 is used by Jupyter
# notebooks. Incompatible with NETWORK=container:XXX.
PORTS=(
  8085:8080
  9239:9229
  9329:9329
)
# Custom entrypoint, leave blank for using the image's built-in option.
ENTRYPOINT=
# The following options are mutually exclusive. Use display for X11 host server
# in Mac? Defaults to false.
X11_MAC=
# Use display for X11 host server in Linux? Defaults to false.
X11_LINUX=





# ---

# Check mlkctxt is present at the system
if command -v mlkctxt &> /dev/null ; then

  if ! mlkctxt -c $MATCH_MLKCTXT ; then exit 1 ; fi

fi

# Manage identifier
if [ ! -z "${ID_ROOT}" ] ; then

  N="${ID_ROOT}_"
  CONTAINER_HOST_NAME_F="--hostname ${N}"

  if [ "${UNIQUE}" = false ] ; then

    CONTAINER_NAME_F="--name ${N}_$(uuidgen)"

  else

    CONTAINER_NAME_F="--name ${N}"

  fi

fi

# Network
if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi

# Env vars
ENV_VARS_F=

if [ ! -z "${ENV_VARS}" ] ; then

  for E in "${ENV_VARS[@]}" ; do

    ARR_E=(${E//=/ })

    ENV_VARS_F="${ENV_VARS_F} -e ${ARR_E[0]}=${ARR_E[1]} "

  done

fi

# Default X11
X11_F=

# X11 for Mac
if [ "${X11_MAC}" = true ] ; then

  # Get local IP
  IP=$(ifconfig en0 | grep inet | awk '$1=="inet" {print $2}')
  X11_F="-e DISPLAY=$IP:0"
  # Prepare XQuartz server
  xhost +$IP

fi

# X11 for Linux
if [ "${X11_LINUX}" = true ] ; then

  X11_F="-e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix"

fi

# Workdir
WORKDIR_F="--workdir /"
if [ ! -z "${WORKDIR}" ] ; then WORKDIR_F="--workdir ${WORKDIR}" ; fi

# Volumes
VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then

  for E in "${VOLUMES[@]}" ; do

    VOLUMES_F="${VOLUMES_F} -v ${E} "

  done

fi

# Ports
PORTS_F=

if [ ! -z "${PORTS}" ] ; then

  for E in "${PORTS[@]}" ; do

    PORTS_F="${PORTS_F} -p ${E} "

  done

fi

# Run mode
if [ ! -z "$RUN_MODE" ] ; then

  if [ "$RUN_MODE" = "PERSISTABLE" ] ; then

    COMMAND_DOCKER="docker run -ti"

  elif [ "$RUN_MODE" = "VOLATILE" ] ; then

    COMMAND_DOCKER="docker run -ti --rm"

  elif [ "$RUN_MODE" = "DAEMON" ] ; then

    COMMAND_DOCKER="docker run -d"

  else

    echo Error: unrecognized RUN_MODE $RUN_MODE, exiting...
    exit 1

  fi

else

  COMMAND_DOCKER="docker run -ti --rm"

fi

# Entrypoint
ENTRYPOINT_F=

if [ ! -z "${ENTRYPOINT}" ] ; then

  ENTRYPOINT_F="--entrypoint ${ENTRYPOINT}"

fi

# User
USER_F="--user 0:0"
if [ ! -z "${USER}" ] ; then USER_F="--user ${USER}:${USER}" ; fi

# Node version
NODE_VERSION_F="latest"
if [ ! -z "${NODE_VERSION}" ] ; then NODE_VERSION_F=$NODE_VERSION ; fi

# Node environment
NODE_ENV_F=development
if [ ! -z "${NODE_ENV}" ] ; then NODE_ENV_F=$NODE_ENV ; fi

# Node memory
NODE_MEMORY_F=2GB
if [ ! -z "${NODE_MEMORY}" ] ; then NODE_MEMORY_F=$NODE_MEMORY ; fi

# Final command
eval  $COMMAND_DOCKER \
        -e "NODE_ENV=${NODE_ENV_F}" \
        -e "NODE_MEMORY=${NODE_MEMORY_F}" \
        $NETWORK \
        $CONTAINER_NAME_F \
        $CONTAINER_HOST_NAME_F \
        $VOLUMES_F \
        $X11_F \
        $PORTS_F \
        $ENTRYPOINT_F \
        $WORKDIR_F \
        $ENV_VARS_F \
        $USER_F \
        malkab/nodejs-dev:$NODE_VERSION_F \
        $COMMAND
