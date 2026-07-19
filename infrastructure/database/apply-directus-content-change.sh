#!/usr/bin/env bash
set -euo pipefail

manifest_path="${1:?manifest path is required}"
if [[ ! -f "$manifest_path" ]]; then
  printf 'Manifest not found: %s\n' "$manifest_path" >&2
  exit 2
fi
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi
: "${DIRECTUS_ADMIN_TOKEN:?DIRECTUS_ADMIN_TOKEN is required in .env}"
: "${DIRECTUS_PUBLIC_URL:?DIRECTUS_PUBLIC_URL is required in .env}"

backup_file="$(pnpm --silent backup)"
gzip -t "$backup_file"
pnpm --silent exec tsx infrastructure/database/apply-directus-content-change.ts "$manifest_path"
printf 'Pre-change backup: %s\n' "$backup_file"
