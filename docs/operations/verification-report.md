# Verification report — 2026-07-18

## Подтверждено

- Docker 29.6.1, Compose 5.3.0.
- `database`, `directus` 12.1.1, `public-web`, `preview`: healthy.
- Directus REST и PostgreSQL readback: `7 published`, `1 draft`.
- Public `/pl/kredyty-hipoteczne`: HTTP 200, `index,follow`, self-canonical.
- Preview `/ru/ipoteka/konsultaciya`: HTTP 200, preview banner, `noindex,nofollow,noarchive`.
- Та же draft-страница в public: redirect на 404.
- `/sitemap.xml`: HTTP 200, 7 URL.
- Browser E2E: 5/5 — published hub/links/SEO, React calculator, consultation demo и preview boundary.
- Unit tests: 9/9; typecheck, lint, Astro build и content validation прошли.

## Russian consultation review candidate

- Исходная неполная версия 1 сохранена без изменений.
- Полная версия 2 содержит rollback snapshot страницы и блоков; транзакционный rollback test восстановил исходный текст.
- Полная версия 3 содержит candidate-текст и совпадает с fixture; повторное применение content change не создаёт дубликаты.
- `change_tasks`: `status=in_review`, `base_version=2`, `candidate_version=3`, `rollback_reference=language_versions:service-ru:2`.
- `service-ru` остаётся `draft`: candidate виден в preview с `noindex`, public продолжает возвращать redirect на `/404`.
- Чистый bootstrap schema → seed → content change проверен на отдельной временной БД; после readback временная БД удалена.

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

- Созданы idempotent `DOMUS Frontend` role, `DOMUS Frontend Read` policy и service user без пароля/Data Studio access.
- Token имеет только read к `pages`, `content_blocks`, `internal_links`, `ctas`; write, `hubs` и `/schema/snapshot` возвращают HTTP 403.
- Public и preview переведены с admin token на `DIRECTUS_FRONTEND_TOKEN`; REST readback и E2E прошли.
- Schema snapshot Directus 12.1.1/PostgreSQL сохранён в Git, содержит девять content collections и не содержит credentials/user data.
- `schema apply --dry-run` подтвердил `No changes to apply`; повторный metadata bootstrap сохранил ровно четыре read permissions.
- Pre-change backup восстановлен в отдельную БД: 7 published + 1 draft, frontend service user отсутствует; временная БД удалена.

## Не подтверждено

- Внешние preview/production URL намеренно не создавались: deployment отложен до готовности сайта.
- Production rollback по GHCR digest: невозможен до первого внешнего deployment.
- Применимость лицензии Directus 12 для будущего production должна быть подтверждена владельцем отдельно.
