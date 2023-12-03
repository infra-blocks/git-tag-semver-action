#!/usr/bin/env bash

# Configure git to work with repos that are shared through volume in actions runtime.
# This is done in the entrypoint as opposed to the docker image because the HOME folder is overridden as a
# shared volume at runtime.
git config --global --add safe.directory /github/workspace

env INPUT_GITHUB-TOKEN="${1}" INPUT_VERSION="${2}" node /action/dist/index.js
