# Rollback

## Код/frontend

1. Найдите последний подтверждённый GHCR digest в GitHub deployment.
2. На хосте установите `WEB_IMAGE=ghcr.io/<owner>/<repo>@sha256:<digest>`.
3. Выполните `docker compose pull public-web && docker compose up -d --no-deps public-web`.
4. Проверьте `/healthz`, canonical pilot URL, metadata, hreflang и ссылки.

## Контент

Для одной записи создайте новую `language_versions` из подтверждённого snapshot и примените её как новую версию; историю не переписывайте. Для аварийного восстановления всей БД используйте backup/restore только после остановки пишущих сервисов и проверки файла.

```bash
pnpm backup
BACKUP_FILE=infrastructure/docker/backups/domus-YYYYmmddTHHMMSS.sql.gz pnpm restore
```

Перед restore также установите `RESTORE_CONFIRM=RESTORE_DOMUS_DATABASE`. Для безопасной тренировки можно указать отдельную существующую БД через `RESTORE_DATABASE=domus_restore_drill`.

Запишите digest, version, время, исполнителя, причину и live readback в `change_tasks.rollback_reference`.

## Directus upgrade

Не запускайте старый Directus поверх базы, уже мигрированной новой major-версией. Для rollback сначала остановите Directus и любые пишущие процессы, восстановите pre-upgrade SQL backup и uploads, затем верните image из предыдущего подтверждённого Git revision.

Перед восстановлением рабочей базы обязательно повторите процедуру на отдельной `RESTORE_DATABASE` и проверьте её предыдущей версией Directus: `/server/ping`, REST counts и прикладные страницы. После рабочего rollback повторите public/preview E2E. В тренировке обновления 12.1.1 backup Directus 11.17.4 был восстановлен в отдельную БД и дал `7 published` + `1 draft`.
