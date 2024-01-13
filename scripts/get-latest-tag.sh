#!/usr/bin/env bash

remote_tags=("$(git ls-remote --tags origin "v*.*.*")")
if test -z "${remote_tags[@]}"; then
  latest_tag=v0.0.0
else
  latest_tag=$(echo "${remote_tags[@]}" | cut -d '/' -f 3 | sort --reverse | head -1)
fi

echo "${latest_tag}"
