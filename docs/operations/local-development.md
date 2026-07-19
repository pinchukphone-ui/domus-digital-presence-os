# Локальная разработка

## Полный стек

1. Установите Docker Desktop, Node.js 22.12+ (версия проекта указана в `.nvmrc`)
   и pnpm 9.
2. `cp .env.example .env` и замените все `change-me` значения. Для secrets используйте `openssl rand -hex 32`.
3. `pnpm install`.
4. `docker compose -f infrastructure/docker/compose.yml --env-file .env up --build`.
5. Проверьте `docker compose ... ps`, Directus `/server/ping`, frontend `/healthz`.

Первый старт применяет `001_content_schema.sql`, `001_mortgage_hub.sql` и content change `002_service_ru_review.sql`. Init scripts PostgreSQL выполняются только на пустом volume. Для существующей базы примените только нужный content change командой `pnpm db:prepare-service-ru-review`; `db:migrate` и `db:seed` рассчитаны на чистую БД.

После отдельного Reviewer `Approved` локально опубликуйте подтверждённую русскую версию командой `pnpm db:publish-service-ru-local`. Команда не входит в автоматический bootstrap и не включает внешний deployment.

Локальный PostgreSQL основан на официальном `16.14-alpine3.24`, закреплённом по digest. Минимальный производный image заменяет только startup-helper `gosu` на пакет Alpine `su-exec`; CI проверяет, что `gosu` отсутствует и сброс привилегий работает.

После изменения Directus collections/fields/relations выполните `pnpm directus:snapshot`. Команда перезаписывает `apps/directus/snapshots/schema.yaml`; перед commit проверьте `schema apply --dry-run` и отсутствие незапланированного diff.

## Быстрый frontend без Docker

```bash
pnpm install
CONTENT_SOURCE=fixture pnpm dev
pnpm validate
pnpm exec playwright install chromium
pnpm test:e2e
```

Fixture не является production source и не разрешает публикацию.

## Адреса

- Directus: `http://localhost:8055`
- public: `http://localhost:4321/pl/kredyty-hipoteczne`
- preview: `http://localhost:4322/pl/kredyty-hipoteczne`
- draft только preview: `http://localhost:4322/ru/ipoteka/konsultaciya`

После изменения renderer roles, policies или tokens выполните `pnpm directus:apply-renderer-access`. Команда применяет metadata bootstrap, перезапускает Directus для сброса permission cache, пересоздаёт public/preview containers и проверяет: pages 200/200, public versions 403, preview versions 200, обе записи 403.

## Directus REST content-change drill

Только после merge operator PR и Reviewer `Approved`:

1. `pnpm directus:apply-service-ru-v5` — создаёт через Directus REST append-only draft v5 и `ChangeTask`; published page/blocks не обновляются.
2. Проверьте public v3 и preview banner/body v5.
3. `pnpm directus:rollback-service-ru-v6` — создаёт следующую append-only revision из полного v4 snapshot; v5 сохраняется в истории.
4. Проверьте public v3 и preview banner v6 с восстановленным v4-текстом.

Обе команды сначала создают и проверяют gzip backup. Они требуют server-side `DIRECTUS_ADMIN_TOKEN` из незакоммиченного `.env`, выполняют API/HTML readback и не разрешают внешний deployment. Повторный запуск идемпотентен; несовпадение base snapshot останавливает операцию до POST.
