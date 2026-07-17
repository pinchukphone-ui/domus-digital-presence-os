#!/usr/bin/env bash
set -euo pipefail
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi
backup_dir="${BACKUP_DIR:-infrastructure/docker/backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$backup_dir/domus-$timestamp.sql.gz"
if command -v pg_dump >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
  pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL" | gzip -9 > "$target"
else
  : "${POSTGRES_USER:?POSTGRES_USER is required}"
  : "${POSTGRES_DB:?POSTGRES_DB is required}"
  docker compose -f infrastructure/docker/compose.yml --env-file .env exec -T database \
    pg_dump --no-owner --no-privileges --clean --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip -9 > "$target"
fi
gzip -t "$target"
printf '%s\n' "$target"
