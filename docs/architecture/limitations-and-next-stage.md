# Ограничения и следующий этап

## Этап 1

- Нет внешнего deployment host, доменов, TLS/SSO и внешних live URL. GitHub remote, Actions, GHCR и environments настроены.
- Локальный контейнерный bootstrap выполнен и проверен; внешний production host всё ещё отсутствует.
- Directus schema snapshot и две read-only renderer policies экспортируются воспроизводимо. Public credential не читает `language_versions`; отдельный preview credential читает draft snapshots. Published-only rows фильтрует public adapter, поскольку Directus Core 12.1.1 ограничивает custom item permission rules. Оба локальных контура привязаны к loopback.
- Directus обновлён до 12.1.1 после локальной проверки миграции. До production требуется отдельное подтверждение применимости Core tier/лицензии и повторная проверка актуальных условий.
- Демонстрационная форма не отправляет и не сохраняет персональные данные.
- Нет webhook, автоматически создающего PR из content-only change; ChangeTask связывает два процесса вручную.
- Backup/restore проверен на отдельной временной БД; аварийный restore рабочей production-БД не выполнялся.
- Производный PostgreSQL image содержит только замену `gosu` на Alpine `su-exec`; его необходимо пересобирать при каждом обновлении закреплённого upstream digest.
- Контент fixture — новый нейтральный пилот, не юридически утверждённый перенос Wix.
- CI fixture пока отражает `7 published + 1 draft`, а локальный Directus — `8 published` и отдельный draft snapshot v4; это локальная closure-задача A1.
- Контентные revisions создавались версионированными SQL/change manifests; Directus-originated REST/UI write остаётся closure-задачей A2.

## Следующий этап

1. Перед внешним deployment добавить preview SSO/basic auth и proxy `X-Robots-Tag`.
2. Подключить управляемый PostgreSQL, object storage и автоматические encrypted backups с restore drill.
3. Поднять preview/production domains, TLS и GitHub environments.
4. Добавить Directus webhook → signed build trigger и content change manifest.
5. Провести редакторскую и юридическую проверку PL/RU, accessibility audit и performance budgets.
6. Добавить observability, uptime check и проверяемый incident/rollback runbook.
