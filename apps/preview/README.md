# Preview profile

Preview не содержит отдельного renderer. Он запускает тот же image `apps/public-web`, но с `PREVIEW_MODE=true`, отдельным стабильным hostname и серверным Directus token. Draft-страницы доступны только здесь; reverse proxy обязан дополнительно установить `X-Robots-Tag: noindex, nofollow, noarchive` и ограничить доступ SSO/basic auth.

