# Deployment

## Выбранный контур этапа 1

Пилот разворачивается на одном Hetzner Cloud VPS в `nbg1` (Германия): Docker
Compose, Caddy для TLS/reverse proxy, PostgreSQL 16, Directus и два независимых
Astro runtime (`preview` и `production`). Production и preview используют разные
Unix-пользователи и разные SSH deployment keys. База и Directus uploads должны
иметь persistent volumes; резервные копии хранятся вне VPS.

Это сознательно односерверный vertical slice, а не целевая high-availability
архитектура. Он повторяет локальный Docker-контур и существующий immutable GHCR
deployment без добавления оркестратора или микросервисов. Решение и границы
описаны в `docs/architecture/deployment-platform-decision.md`.

## Предварительная настройка

1. Создайте Hetzner Cloud VPS с firewall и backups; для пилота — shared x86,
   минимум 2 vCPU / 4 GB RAM. Добавьте оба публичных deployment key из GitHub
   environment variables `DEPLOY_SSH_PUBLIC_KEY` соответствующим Unix-пользователям.
2. Установите Docker/Compose и Caddy, создайте закрытые runtime `.env` и persistent
   volumes. Секреты PostgreSQL/Directus остаются только на хосте.
3. После назначения адреса добавьте отдельно в каждый GitHub Environment variables
   `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` и `PREVIEW_URL`/`PRODUCTION_URL`.
4. Получите host key напрямую с созданного VPS, проверьте fingerprint в Hetzner
   Console и добавьте environment secret `DEPLOY_KNOWN_HOSTS`. Не используйте
   непроверенный результат сетевого `ssh-keyscan`.
5. Preview hostname закройте SSO/basic auth; Caddy добавляет
   `X-Robots-Tag: noindex, nofollow, noarchive`.
6. Только после Reviewer approval и успешного preview установите repository
   variable `DEPLOYMENT_ENABLED=true`. До этого deploy jobs всегда skipped.

## Поток

- Pull request запускает CI и собирает проверяемый image.
- Preview deployment использует тот же image с `PREVIEW_MODE=true`; URL фиксируется в GitHub Environment/PR.
- Merge в `main` создаёт image с тегами commit SHA и `main`.
- Job `production` ждёт environment approval, требует заранее подтверждённый backup, разворачивает image по digest и запускает live verification. Автоматизация remote backup — ограничение этапа 1.

Секреты Directus и PostgreSQL не входят в image, Git или build args. Независимые read-only `DIRECTUS_PUBLIC_TOKEN` и `DIRECTUS_PREVIEW_TOKEN` передаются в `DIRECTUS_STATIC_TOKEN` только соответствующего server runtime; admin token frontend-контейнеры не получают. Public policy не читает `language_versions`; published-only rows фильтрует public adapter. Directus Core 12.1.1 не разрешает custom item rules, поэтому до внешнего deployment нужны лицензированный tier либо published-only API/views и отдельный сетевой контур.

## Текущее состояние URL

GitHub remote, environments и branch protection подготовлены.
`DEPLOYMENT_ENABLED=false`; VPS, домены, SSH deployment keys, `DEPLOY_HOST`, URL и
проверенный `DEPLOY_KNOWN_HOSTS` ещё не созданы. Поэтому preview и production-пилот
не развернуты, а локальные адреса не являются внешними URL.
