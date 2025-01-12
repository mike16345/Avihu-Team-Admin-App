#!/bin/bash

echo "Branch: $VERCEL_GIT_COMMIT_REF"
echo "Environment: $VERCEL_ENV"

# Skip build for 'devel' branch in preview environment
if [ "$VERCEL_GIT_COMMIT_REF" = "devel" ] && [ "$VERCEL_ENV" = "preview" ]; then
  echo "Skipping build for devel branch in preview environment"
  exit 0
else
  echo "Proceeding with build"
  exit 1
fi
