#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(cd -- "$script_dir/../.." && pwd)"
change_file="$repository_root/infrastructure/database/content-changes/003_publish_service_ru.sql"

cd "$repository_root"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$change_file"
  exit 0
fi

: "${POSTGRES_USER:?POSTGRES_USER is required in .env when local psql/DATABASE_URL is unavailable}"
: "${POSTGRES_DB:?POSTGRES_DB is required in .env when local psql/DATABASE_URL is unavailable}"

docker compose --env-file .env -f infrastructure/docker/compose.yml exec -T database \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 < "$change_file"
