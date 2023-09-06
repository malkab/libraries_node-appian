#!/bin/bash

docker run -ti --rm \
    -e NODE_ENV=development \
    -e NODE_MEMORY=2GB \
    --name appian_dev \
    --hostname appian_dev \
    -v $(pwd)/../node/:$(pwd)/../node/ \
    -v $(pwd)/../test_data/:/test_data \
    -v $(pwd)/data/:/data \
    -v $(pwd)/logs:/logs \
    -v ~/.npmrc:/root/.npmrc \
    -v ~/.npmrc:/home/node/.npmrc \
    -v $(pwd)/../test_files_for_downloading/:/test_files_for_downloading/:ro \
    -p 8085:8080 \
    -p 9239:9229 \
    -p 9329:9329 \
    --workdir $(pwd)/../node/ \
    --user 1000:1000 \
    malkab/nodejs-dev:16.13.2
