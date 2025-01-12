#!/bin/bash

echo "Branch: $VERCEL_GIT_BRANCH"
echo "Environment: $VERCEL_ENV"

if [ "$VERCEL_GIT_BRANCH" = "devel" ] && [ "$VERCEL_ENV" = "preview" ]; then
  echo "Skipping build for devel in preview environment"
  exit 0
else
  echo "Proceeding with build"
  exit 1
fi
