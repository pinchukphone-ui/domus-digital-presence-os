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
