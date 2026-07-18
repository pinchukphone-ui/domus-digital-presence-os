# Directus

Directus 12.1.1 запускается из image, закреплённого одновременно по версии и multi-platform digest. Пользовательские коллекции создаются SQL migration при первом старте PostgreSQL и автоматически отражаются Directus. `ADMIN_TOKEN` используется только сервером Astro; не передавайте его в браузер.

Перед обновлением Directus создайте SQL backup и копию `apps/directus/uploads`. После обновления проверьте `/server/ping`, REST readback, public/preview boundaries и E2E. Directus 12 изменил лицензию и ввёл active license enforcement; до production владелец должен подтвердить применимость Core tier или предоставить подходящую лицензию.
