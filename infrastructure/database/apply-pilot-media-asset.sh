#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(cd -- "$script_dir/../.." && pwd)"
change_file="$repository_root/infrastructure/database/content-changes/004_pilot_media_asset.sql"

cd "$repository_root"
set -a
source .env
set +a

: "${POSTGRES_USER:?POSTGRES_USER is required in .env}"
: "${POSTGRES_DB:?POSTGRES_DB is required in .env}"

docker compose --env-file .env -f infrastructure/docker/compose.yml exec -T database \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 < "$change_file"

docker compose --env-file .env -f infrastructure/docker/compose.yml up -d --force-recreate directus-metadata public-web preview preview-gateway

docker compose --env-file .env -f infrastructure/docker/compose.yml exec -T database \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc \
  "SELECT id || '|' || alt_pl || '|' || alt_ru || '|' || rights_source FROM media_assets WHERE id = '55555555-5555-4555-8555-555555555555';"
