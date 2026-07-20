#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
repository_root="$(cd -- "$script_dir/../.." && pwd)"
cd "$repository_root"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

: "${DIRECTUS_PUBLIC_TOKEN:?DIRECTUS_PUBLIC_TOKEN is required in .env}"
: "${DIRECTUS_PREVIEW_TOKEN:?DIRECTUS_PREVIEW_TOKEN is required in .env}"

compose=(docker compose --env-file .env -f infrastructure/docker/compose.yml)
"${compose[@]}" up --force-recreate directus-metadata
"${compose[@]}" restart directus
"${compose[@]}" up -d --force-recreate --no-deps public-web preview preview-gateway

for attempt in {1..30}; do
  if curl -fs http://127.0.0.1:8055/server/ping >/dev/null \
    && curl -fs http://127.0.0.1:4321/healthz >/dev/null \
    && curl -fs http://127.0.0.1:4322/healthz >/dev/null; then
    break
  fi
  if [[ "$attempt" == 30 ]]; then
    echo 'Directus or renderer health check did not recover' >&2
    exit 1
  fi
  sleep 1
done

request_status() {
  curl -sS -o /dev/null -w '%{http_code}' "$@"
}

public_versions="$(request_status -H "Authorization: Bearer $DIRECTUS_PUBLIC_TOKEN" 'http://127.0.0.1:8055/items/language_versions?limit=1')"
preview_versions="$(request_status -H "Authorization: Bearer $DIRECTUS_PREVIEW_TOKEN" 'http://127.0.0.1:8055/items/language_versions?limit=1')"
public_source_pages="$(request_status -H "Authorization: Bearer $DIRECTUS_PUBLIC_TOKEN" 'http://127.0.0.1:8055/items/pages?limit=1')"
public_pages="$(request_status -H "Authorization: Bearer $DIRECTUS_PUBLIC_TOKEN" 'http://127.0.0.1:8055/items/published_pages?limit=1')"
preview_pages="$(request_status -H "Authorization: Bearer $DIRECTUS_PREVIEW_TOKEN" 'http://127.0.0.1:8055/items/pages?limit=1')"
public_write="$(request_status -X POST -H "Authorization: Bearer $DIRECTUS_PUBLIC_TOKEN" -H 'Content-Type: application/json' --data '{}' 'http://127.0.0.1:8055/items/published_pages')"
preview_write="$(request_status -X POST -H "Authorization: Bearer $DIRECTUS_PREVIEW_TOKEN" -H 'Content-Type: application/json' --data '{}' 'http://127.0.0.1:8055/items/pages')"

if [[ "$public_versions" != 403 || "$preview_versions" != 200 || "$public_source_pages" != 403 || "$public_pages" != 200 || "$preview_pages" != 200 || "$public_write" != 403 || "$preview_write" != 403 ]]; then
  printf 'Renderer access verification failed: public_versions=%s preview_versions=%s public_source_pages=%s public_pages=%s preview_pages=%s public_write=%s preview_write=%s\n' \
    "$public_versions" "$preview_versions" "$public_source_pages" "$public_pages" "$preview_pages" "$public_write" "$preview_write" >&2
  exit 1
fi

printf 'Renderer access verified: public source pages 403, published projection 200, preview source pages 200, versions 403/200, writes 403/403\n'
