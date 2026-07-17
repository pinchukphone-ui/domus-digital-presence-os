# DOMUS Digital Presence OS

Первый независимый от Wix production-контур: PostgreSQL + Directus + Astro. Польская и русская версии ипотечного хаба хранятся как отдельные записи, связанные `translation_group`.

## Быстрый запуск

Требуются Node.js 22+, pnpm 9 и Docker Desktop.

```bash
cp .env.example .env
# замените все change-me значения
pnpm install
docker compose -f infrastructure/docker/compose.yml --env-file .env up --build
```

- Directus: <http://localhost:8055>
- production-like frontend: <http://localhost:4321/pl/kredyty-hipoteczne>
- preview (включает drafts, `noindex`): <http://localhost:4322/pl/kredyty-hipoteczne>

Без Docker можно проверить frontend на fixture-данных:

```bash
pnpm install
CONTENT_SOURCE=fixture pnpm dev
pnpm validate
```

Операционные инструкции: [локальный запуск](docs/operations/local-development.md), [deployment](docs/operations/deployment.md), [rollback](docs/operations/rollback.md).

