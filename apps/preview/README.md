# Preview profile

Preview использует тот же Astro image `apps/public-web` с `PREVIEW_MODE=true` и отдельным server-only Directus token. Astro renderer доступен только внутри Compose network; внешний локальный порт `4322` принадлежит этому gateway.

Gateway выполняет только инфраструктурную границу preview:

- пропускает `/healthz` без аутентификации;
- требует Basic Auth для остальных URL;
- удаляет `Authorization` перед отправкой запроса в Astro;
- принудительно добавляет `X-Robots-Tag: noindex, nofollow, noarchive` ко всем ответам, включая `401`, `404` и redirects.

Credentials задаются `PREVIEW_AUTH_USER` и `PREVIEW_AUTH_PASSWORD` в незакоммиченном `.env`. Для совместимости существующего локального контура Compose использует read-only `DIRECTUS_PREVIEW_TOKEN` как fallback password; перед внешним deployment обязателен отдельный secret или SSO.

Для безопасной локальной ротации используйте `pnpm preview:rotate-local-credentials`: значения заменяются атомарно, не выводятся в terminal, после чего renderer metadata и контейнеры применяются повторно.
