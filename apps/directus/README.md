# Directus

Directus 12.1.1 запускается из image, закреплённого одновременно по версии и multi-platform digest. Пользовательские коллекции создаются SQL migration при первом старте PostgreSQL и автоматически отражаются Directus. Admin token используется только bootstrap/операциями. Public Astro получает `DIRECTUS_PUBLIC_TOKEN` без доступа к версиям; preview получает отдельный `DIRECTUS_PREVIEW_TOKEN` с read-only доступом к версиям. Оба токена server-only и не имеют write/Data Studio доступа. Не передавайте токены в браузер.

Directus Core 12.1.1 ограничивает custom item permission rules (`RESOURCE_RESTRICTED: custom_permission_rules_enabled`). Поэтому public credential читает четыре renderer-коллекции, а published-only граница дополнительно обеспечивается public adapter. До внешнего deployment нужен подтверждённый Directus tier с item rules либо published-only API/views и отдельный сетевой контур.

`pnpm directus:snapshot` обновляет versioned snapshot `apps/directus/snapshots/schema.yaml`. После изменения модели выполните snapshot и затем `schema apply --dry-run`; snapshot не содержит пользователей, policies или secrets.

Перед обновлением Directus создайте SQL backup и копию `apps/directus/uploads`. После обновления проверьте `/server/ping`, REST readback, public/preview boundaries и E2E. Directus 12 изменил лицензию и ввёл active license enforcement; до production владелец должен подтвердить применимость Core tier или предоставить подходящую лицензию.
