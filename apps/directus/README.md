# Directus

Directus 12.1.1 запускается из image, закреплённого одновременно по версии и multi-platform digest. Пользовательские коллекции создаются SQL migration при первом старте PostgreSQL и автоматически отражаются Directus. Admin token используется только bootstrap/операциями, а Astro получает отдельный `DIRECTUS_FRONTEND_TOKEN` с четырьмя read-only permissions; не передавайте токены в браузер.

`pnpm directus:snapshot` обновляет versioned snapshot `apps/directus/snapshots/schema.yaml`. После изменения модели выполните snapshot и затем `schema apply --dry-run`; snapshot не содержит пользователей, policies или secrets.

Перед обновлением Directus создайте SQL backup и копию `apps/directus/uploads`. После обновления проверьте `/server/ping`, REST readback, public/preview boundaries и E2E. Directus 12 изменил лицензию и ввёл active license enforcement; до production владелец должен подтвердить применимость Core tier или предоставить подходящую лицензию.
