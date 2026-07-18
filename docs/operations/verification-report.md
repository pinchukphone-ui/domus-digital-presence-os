# Verification report — 2026-07-18

## Подтверждено

- Docker 29.6.1, Compose 5.3.0.
- `database`, `directus` 12.1.1, `public-web`, `preview`: healthy.
- Directus REST и PostgreSQL readback: `7 published`, `1 draft`.
- Public `/pl/kredyty-hipoteczne`: HTTP 200, `index,follow`, self-canonical.
- Preview `/ru/ipoteka/konsultaciya`: HTTP 200, preview banner, `noindex,nofollow,noarchive`.
- Та же draft-страница в public: redirect на 404.
- `/sitemap.xml`: HTTP 200, 7 URL.
- Browser E2E: 3/3 — published hub/links/SEO, React calculator, preview boundary.
- Unit tests: 4/4; typecheck, lint, Astro build и content validation прошли.

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

## Не подтверждено

- Внешние preview/production URL намеренно не создавались: deployment отложен до готовности сайта.
- Production rollback по GHCR digest: невозможен до первого внешнего deployment.
- Применимость лицензии Directus 12 для будущего production должна быть подтверждена владельцем отдельно.
