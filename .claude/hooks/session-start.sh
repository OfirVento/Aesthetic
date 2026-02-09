#!/bin/bash
set -euo pipefail

# Only run in remote (Claude Code on the web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Install npm dependencies (idempotent - skips if already up to date)
npm install

# Ensure .env.local exists (copy from example if missing)
if [ ! -f .env.local ] && [ -f .env.local.example ]; then
  cp .env.local.example .env.local
fi
