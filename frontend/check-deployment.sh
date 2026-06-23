#!/bin/bash

# Decide whether Vercel should build a preview for this push.
# We build:
#   • The `devel` branch (the team's main preview track)
#   • Any branch starting with `feature/avihu-` (Avihu's redesign work)
# Anything else in preview is skipped to save build quota.

echo "Branch: $VERCEL_GIT_COMMIT_REF"
echo "Environment: $VERCEL_ENV"

# Production builds (master) and any non-preview environment — always build.
if [ "$VERCEL_ENV" != "preview" ]; then
  echo "Proceeding with build (non-preview environment)"
  exit 1
fi

# Allow `devel` previews.
if [ "$VERCEL_GIT_COMMIT_REF" = "devel" ]; then
  echo "Proceeding with build (devel preview)"
  exit 1
fi

# Allow Avihu's feature branches.
case "$VERCEL_GIT_COMMIT_REF" in
  feature/avihu-*)
    echo "Proceeding with build (Avihu feature preview)"
    exit 1
    ;;
esac

echo "Skipping build for $VERCEL_GIT_COMMIT_REF branch in preview environment"
exit 0
