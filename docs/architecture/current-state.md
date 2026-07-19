# Текущее состояние репозитория

Первичный аудит: 2026-07-17. Текущий readback: 2026-07-19.

До начала этапа каталог был пуст: отсутствовали Git metadata, исходный код, package manager manifest, CI/CD, инфраструктура и интеграции. Поэтому существующего способа локального запуска, preview или production deployment не было. Ниже отдельно зафиксирован результат, достигнутый к завершению локального vertical slice.

## Результат аудита

| Область | Исходное состояние | Решение этапа 1 |
| --- | --- | --- |
| Стек | отсутствовал | TypeScript, Astro, React island, Directus 12.1.1, PostgreSQL 16 |
| Package manager | отсутствовал | pnpm workspace 9.15.4 |
| Структура | пустой каталог | модульный monorepo без микросервисов |
| Инфраструктура | в момент первичного аудита Docker CLI отсутствовал | Docker Desktop 29.6.1 запущен; полный Compose проверен live |
| Интеграции | отсутствовали | Directus REST, GitHub Actions и GHCR; внешний host не подключён |
| Monorepo | ограничений нет | пригоден; единый lockfile и общие пакеты |
| Локальный запуск | отсутствовал | Compose или fixture-режим Astro |
| Preview | отсутствовал | тот же SSR image с `PREVIEW_MODE=true`, version-aware drafts и `noindex`; пока только localhost |
| Production | отсутствовал | локальный public runtime и immutable GHCR image; внешний pilot gated/off |

Wix находится вне репозитория и не является зависимостью этого контура. Никаких операций чтения/записи или публикации в Wix этап не выполняет.

## Доступная локальная среда

- Node.js `v22.14.0`, npm `10.9.2`, pnpm `9.15.4`, Git `2.50.1`.
- После первичного аудита установлен и запущен Docker 29.6.1 / Compose 5.3.0. PostgreSQL, Directus, public и preview прошли health и HTTP/БД readback.
- Публичный GitHub remote, Actions, GHCR, environments и branch protection настроены. `main` требует PR и актуальный `validate`; обязательное число GitHub approvals сейчас равно нулю.
- `DEPLOYMENT_ENABLED=false`. Внешние домены, deployment host и environment-scoped SSH secrets не созданы.

Итоговая приёмка и оставшиеся пробелы: `stage-1-acceptance.md`.
