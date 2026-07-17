# Deployment

## Предварительная настройка

1. Создайте GitHub remote и GHCR package.
2. Создайте environments `preview` и `production`; для production включите required reviewer и запрет self-review.
3. На хосте установите Docker/Compose, TLS reverse proxy и создайте закрытый `.env`.
4. Добавьте GitHub variables `PREVIEW_BASE_DOMAIN`, `PRODUCTION_URL`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`; secrets `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`.
5. Preview hostname должен быть закрыт SSO/basic auth; proxy добавляет `X-Robots-Tag: noindex, nofollow, noarchive`.

## Поток

- Pull request запускает CI и собирает проверяемый image.
- Preview deployment использует тот же image с `PREVIEW_MODE=true`; URL фиксируется в GitHub Environment/PR.
- Merge в `main` создаёт image с тегами commit SHA и `main`.
- Job `production` ждёт environment approval, требует заранее подтверждённый backup, разворачивает image по digest и запускает live verification. Автоматизация remote backup — ограничение этапа 1.

Секреты Directus и PostgreSQL не входят в image, Git или build args. `DIRECTUS_STATIC_TOKEN` доступен только server runtime.

## Текущее состояние URL

Внешняя инфраструктура, домены и GitHub remote не предоставлены, поэтому preview и production-пилот не развернуты. Локальные адреса не являются production URL.
