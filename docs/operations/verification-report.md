# Verification report — 2026-07-17

## Подтверждено

- Docker 29.6.1, Compose 5.3.0.
- `database`, `directus` 11.17.4, `public-web`, `preview`: healthy.
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

## Не подтверждено

- Внешние preview/production URL: отсутствуют host, домены, GitHub remote и deployment secrets.
- Production rollback по GHCR digest: невозможен до первого внешнего deployment.
