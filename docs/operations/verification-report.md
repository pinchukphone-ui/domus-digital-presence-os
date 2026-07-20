# Verification report — 2026-07-18

## Подтверждено

- Docker 29.6.1, Compose 5.3.0.
- `database`, `directus` 12.1.1, `public-web`, `preview`: healthy.
- Directus REST и PostgreSQL readback: `8` published page rows; отдельный version snapshot v4 остаётся `draft`.
- Public `/pl/kredyty-hipoteczne`: HTTP 200, `index,follow`, self-canonical.
- Preview `/ru/ipoteka/konsultaciya`: HTTP 200, version-aware banner `PREVIEW · v4`, `noindex,nofollow,noarchive`.
- Та же страница в public: HTTP 200, published v3 и `index,follow`; текст v4 отсутствует.
- `/sitemap.xml`: HTTP 200, 8 URL.
- Browser E2E: 6/6 — published hub/links/SEO, React calculator, consultation demo, preview и sitemap boundaries.
- Unit tests: 31/31; E2E: 6/6; typecheck, lint, Astro build и content validation для 8 published pages прошли. Directus REST v5/v6 execution остаётся post-merge gate.

## Russian consultation review candidate

- Исходная неполная версия 1 сохранена без изменений.
- Полная версия 2 содержит rollback snapshot страницы и блоков; транзакционный rollback test восстановил исходный текст.
- Полная версия 3 содержит candidate-текст и совпадает с fixture; повторное применение content change не создаёт дубликаты.
- `change_tasks`: `status=in_review`, `base_version=2`, `candidate_version=3`, `rollback_reference=language_versions:service-ru:2`.
- `service-ru` остаётся `draft`: candidate виден в preview с `noindex`, public продолжает возвращать redirect на `/404`.
- Чистый bootstrap schema → seed → content change проверен на отдельной временной БД; после readback временная БД удалена.
- Документированная команда `pnpm db:prepare-service-ru-review` проверена без локального `psql`: wrapper применил idempotent change через Docker Compose.

## Russian consultation local publication

- Reviewer status: `Approved`; content version 3 опубликована только в локальном public-контуре.
- Источник: commit `a6753b7f2deb8a93f28d2aa02b2f390bd6eb32da`, image digest `sha256:d9d8a6c9e5a57250d4c9ec41636206331cc315159715e60a9eda164686d3c2d5`.
- `service-ru`: page/version `published`, ChangeTask `approved`; статус `deployed` не используется без внешнего deployment.
- Public URL `/ru/ipoteka/konsultaciya`: HTTP 200, `index,follow`, один H1, self-canonical, PL/RU/x-default hreflang и рабочая локальная форма.
- Польская сервисная страница получила обратный RU hreflang; RU home содержит service link и CTA; sitemap содержит 8 URL.
- Preview того же URL остаётся `noindex,nofollow,noarchive`.
- `003_publish_service_ru.sql` проверен на чистой временной БД и повторным idempotent запуском; он намеренно не входит в автоматический bootstrap.
- Перед промоцией создан backup `domus-20260718T150703Z.sql.gz`. Restore в отдельную БД вернул `page=draft`, `version=draft`, `task=in_review`; временная БД после readback удалена.
- Внешний deployment намеренно не выполнялся, `DEPLOYMENT_ENABLED=false`.

## Backup/restore drill

- Создан gzip SQL backup `infrastructure/docker/backups/domus-20260717T191153Z.sql.gz`; файл прошёл `gzip -t`.
- Backup восстановлен в отдельную БД `domus_restore_drill`.
- Readback восстановленной БД: 7 published + 1 draft.
- После проверки временная БД удалена; рабочий volume не изменялся.

## Directus 12 upgrade

- Перед обновлением создан и проверен gzip SQL backup; отдельно сохранён каталог uploads.
- Миграция 11.17.4 → 12.1.1 сначала выполнена на изолированной копии базы.
- Контейнер закреплён по версии и multi-platform digest; liveness переведён на `/server/ping` согласно Directus 12.
- После обновления повторно проверены REST/БД readback, public/preview boundaries и E2E.
- В image scan Directus 12.1.1 остаётся один high severity finding; его эксплуатационный путь требует влияния на системную сетевую конфигурацию контейнера. Это известный остаточный риск до исправленного upstream image.

## PostgreSQL image

- PostgreSQL закреплён на актуальном minor-релизе `16.14-alpine3.24` и multi-platform digest официального image.
- Встроенный `gosu 1.19` (Go 1.24.6) заменён на Alpine `su-exec`; `gosu` удалён из итоговой файловой системы.
- Чистый bootstrap проверен на временном `tmpfs`: PostgreSQL стартовал от uid 70, запись/чтение прошли.
- Docker Scout продолжает наследовать 1 critical + 16 high для удалённого `gosu` из SBOM базового слоя. Фактическое отсутствие бинарника проверяется во время CI build.
- Перед заменой контейнера создан gzip SQL backup; восстановление отдельно проверено без изменения рабочего volume.

## Directus read-only access and snapshot

- Созданы idempotent public/preview renderer roles, policies и service users без пароля/Data Studio access.
- Public credential читает только published `pages`, связанные `content_blocks`, `internal_links`, `ctas`; preview credential дополнительно читает `language_versions`. Write, `hubs` и `/schema/snapshot` возвращают HTTP 403.
- Public и preview используют независимые server-only credentials; REST readback и E2E прошли.
- Schema snapshot Directus 12.1.1/PostgreSQL сохранён в Git, содержит девять content collections и не содержит credentials/user data.
- `schema apply --dry-run` подтвердил `No changes to apply`; повторный metadata bootstrap сохранил ровно пять read permissions.

## Version-aware preview after local publication

- Public consultation остаётся на published v3; новый immutable v4 имеет статус `draft`, отдельный `ChangeTask` — `in_review`, rollback reference — `language_versions:service-ru:3`.
- Public renderer не запрашивает `language_versions`: URL возвращает v3, `index,follow` и не содержит v4.
- Preview выбирает только последнюю draft-версию новее последней published-версии: URL возвращает v4, banner `PREVIEW · v4` и `noindex,nofollow,noarchive`.
- Старые draft rollback snapshots, включая v2, не могут перекрыть более новую published v3.
- Preview token: чтение `language_versions` HTTP 200, запись HTTP 403. Перед изменением создан backup `domus-20260718T154443Z.sql.gz`.

## Separate public and preview renderer credentials

- Общий renderer token заменён двумя случайными локальными credentials, которые не входят в Git и принадлежат разным Directus service users/roles/policies.
- Public policy: 4 read permissions без `language_versions` (HTTP 403); published-only rows фильтрует public adapter. Directus Core 12.1.1 вернул `RESOURCE_RESTRICTED` для custom item rules, это явно сохранённое ограничение до внешнего deployment.
- Preview policy: 5 read permissions, включая `language_versions` HTTP 200. Запись обоими credentials, `hubs` и schema snapshot возвращают HTTP 403.
- `pnpm directus:apply-renderer-access` идемпотентно применяет metadata, перезапускает Directus для сброса permission cache, пересоздаёт renderer-контейнеры без повторного metadata запуска и выполняет REST security gate.
- Перед изменением создан и проверен backup `domus-20260718T162512Z.sql.gz`; public v3 / preview v4 boundary после ротации сохранена.
- Pre-change backup восстановлен в отдельную БД: 7 published + 1 draft, frontend service user отсутствует; временная БД удалена.

## Preview sitemap boundary

- Build-time `@astrojs/sitemap` удалён из общего public/preview image; публичный sitemap продолжает формироваться runtime-маршрутом `/sitemap.xml` только из published-страниц.
- Preview `/sitemap.xml` возвращает HTTP 404, а отсутствующие `/sitemap-index.xml` и `/sitemap-0.xml` направляются на `/404`; draft URL не экспортируется.
- Regression E2E: 6/6. Локальный Docker readback подтвердил public sitemap HTTP 200, preview sitemap HTTP 404 и draft-страницу HTTP 200 с `noindex,nofollow,noarchive`.

## Local authenticated preview gateway

- Astro preview renderer больше не публикует host port; стабильный `localhost:4322` обслуживает отдельный infrastructure gateway из `apps/preview`.
- `/healthz` доступен без credentials; все content URL без Basic Auth возвращают HTTP 401 и `WWW-Authenticate` до обращения к renderer.
- Authenticated preview сохраняет тот же Astro component tree и Directus preview token; Basic `Authorization` удаляется перед upstream.
- Все gateway responses, включая 401, rendered 200, 404 и redirects, принудительно содержат raw header `X-Robots-Tag: noindex, nofollow, noarchive`.
- Unit и E2E покрывают auth rejection, credential stripping, raw headers, preview v6 и sitemap boundary. Внешний SSO/TLS hostname намеренно не создавался.
- `pnpm preview:rotate-local-credentials` атомарно заменяет оба локальных preview secrets без вывода значений, повторно применяет Directus metadata и пересоздаёт gateway; rotation readback сохранил permission gate `pages 200/200, versions 403/200, writes 403/403`.

## Не подтверждено

- Внешние preview/production URL намеренно не создавались: deployment отложен до готовности сайта.
- Production rollback по GHCR digest: невозможен до первого внешнего deployment.
- Применимость лицензии Directus 12 для будущего production должна быть подтверждена владельцем отдельно.
