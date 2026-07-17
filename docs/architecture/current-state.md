# Текущее состояние репозитория

Дата аудита: 2026-07-17. До начала этапа каталог был пуст: отсутствовали Git metadata, исходный код, package manager manifest, CI/CD, инфраструктура и интеграции. Поэтому существующего способа локального запуска, preview или production deployment не было.

## Результат аудита

| Область | Исходное состояние | Решение этапа 1 |
| --- | --- | --- |
| Стек | отсутствовал | TypeScript, Astro, React island, Directus 11.17.4, PostgreSQL 16 |
| Package manager | отсутствовал | pnpm workspace 9.15.4 |
| Структура | пустой каталог | модульный monorepo без микросервисов |
| Инфраструктура | в момент первичного аудита Docker CLI отсутствовал | Docker Desktop 29.6.1 запущен; полный Compose проверен live |
| Интеграции | отсутствовали | Directus REST и GitHub Actions/GHCR |
| Monorepo | ограничений нет | пригоден; единый lockfile и общие пакеты |
| Локальный запуск | отсутствовал | Compose или fixture-режим Astro |
| Preview | отсутствовал | тот же frontend image с `PREVIEW_MODE=true`, drafts и `noindex` |
| Production | отсутствовал | immutable GHCR image + защищённый GitHub Environment |

Wix находится вне репозитория и не является зависимостью этого контура. Никаких операций чтения/записи или публикации в Wix этап не выполняет.

## Доступная локальная среда

- Node.js `v22.14.0`, npm `10.9.2`, pnpm `9.15.4`, Git `2.50.1`.
- После первичного аудита установлен и запущен Docker 29.6.1 / Compose 5.3.0. PostgreSQL, Directus, public и preview прошли health и HTTP/БД readback.
- Внешние домены, GitHub remote, GHCR credentials и deployment host не предоставлены.
