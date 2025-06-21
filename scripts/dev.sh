#!/usr/bin/env bash
set -e

# Determine repository root
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Run Miniflare, Laravel and Plasmo extension concurrently
npx concurrently -k \
  "cd edge-api && npx wrangler dev" \
  "cd api && php artisan serve" \
  "cd extension && npx plasmo dev"
