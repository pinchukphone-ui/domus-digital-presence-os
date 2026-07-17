#!/usr/bin/env bash
set -euo pipefail
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi
: "${BACKUP_FILE:?BACKUP_FILE is required}"
if [[ "${RESTORE_CONFIRM:-}" != "RESTORE_DOMUS_DATABASE" ]]; then
  printf '%s\n' 'Refusing restore. Set RESTORE_CONFIRM=RESTORE_DOMUS_DATABASE after stopping writers.' >&2
  exit 2
fi
if [[ ! -f "$BACKUP_FILE" || "$BACKUP_FILE" != *.sql.gz ]]; then
  printf 'Invalid backup file: %s\n' "$BACKUP_FILE" >&2
  exit 2
fi
gzip -t "$BACKUP_FILE"
if command -v psql >/dev/null 2>&1 && [[ -n "${DATABASE_URL:-}" ]]; then
  gzip -dc "$BACKUP_FILE" | psql -v ON_ERROR_STOP=1 "$DATABASE_URL"
else
  : "${POSTGRES_USER:?POSTGRES_USER is required}"
  : "${POSTGRES_DB:?POSTGRES_DB is required}"
  restore_database="${RESTORE_DATABASE:-$POSTGRES_DB}"
  gzip -dc "$BACKUP_FILE" | docker compose -f infrastructure/docker/compose.yml --env-file .env exec -T database \
    psql -U "$POSTGRES_USER" -d "$restore_database" -v ON_ERROR_STOP=1
fi
