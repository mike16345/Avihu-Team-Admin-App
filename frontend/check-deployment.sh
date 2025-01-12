#!/bin/bash

echo "Branch: $VERCEL_GIT_COMMIT_REF"
echo "Environment: $VERCEL_ENV"

if [ "$VERCEL_GIT_COMMIT_REF" != "devel" ] && [ "$VERCEL_ENV" = "preview" ]; then
  echo "Skipping build for $VERCEL_GIT_COMMIT_REF branch in preview environment"
  exit 0
else
  echo "Proceeding with build"
  exit 1
fi
