# Локальная разработка

## Полный стек

1. Установите Docker Desktop, Node.js 22 и pnpm 9.
2. `cp .env.example .env` и замените все `change-me` значения. Для secrets используйте `openssl rand -hex 32`.
3. `pnpm install`.
4. `docker compose -f infrastructure/docker/compose.yml --env-file .env up --build`.
5. Проверьте `docker compose ... ps`, Directus `/server/health`, frontend `/healthz`.

Первый старт применяет `001_content_schema.sql` и `001_mortgage_hub.sql`. Init scripts PostgreSQL выполняются только на пустом volume. Для повторного применения используйте `DATABASE_URL` и команды `pnpm db:migrate`/`pnpm db:seed`; seed рассчитан на чистую БД.

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

