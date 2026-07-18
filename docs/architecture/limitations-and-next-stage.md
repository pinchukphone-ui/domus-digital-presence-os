# Ограничения и следующий этап

## Этап 1

- Нет внешнего deployment host, доменов, TLS/SSO, GitHub remote и live URL.
- Локальный контейнерный bootstrap выполнен и проверен; внешний production host всё ещё отсутствует.
- Directus schema snapshot и read-only frontend policy экспортируются воспроизводимо. Один service token читает published и draft records для server-side public/preview rendering; перед внешним deployment их следует разделить на независимые public/preview credentials и сетевые контуры.
- Directus обновлён до 12.1.1 после локальной проверки миграции. До production требуется отдельное подтверждение применимости Core tier/лицензии и повторная проверка актуальных условий.
- Демонстрационная форма не отправляет и не сохраняет персональные данные.
- Нет webhook, автоматически создающего PR из content-only change; ChangeTask связывает два процесса вручную.
- Backup/restore проверен на отдельной временной БД; аварийный restore рабочей production-БД не выполнялся.
- Производный PostgreSQL image содержит только замену `gosu` на Alpine `su-exec`; его необходимо пересобирать при каждом обновлении закреплённого upstream digest.
- Контент fixture — новый нейтральный пилот, не юридически утверждённый перенос Wix.

## Следующий этап

1. Разделить локальный frontend token на независимые public/preview credentials перед внешним deployment.
2. Подключить управляемый PostgreSQL, object storage и автоматические encrypted backups с restore drill.
3. Поднять preview/production domains, TLS, SSO и GitHub environments.
4. Добавить Directus webhook → signed build trigger и content change manifest.
5. Провести редакторскую и юридическую проверку PL/RU, accessibility audit и performance budgets.
6. Добавить observability, uptime check и проверяемый incident/rollback runbook.
