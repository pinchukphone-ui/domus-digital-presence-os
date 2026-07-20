# Ограничения и следующий этап

## Этап 1

- Нет внешнего deployment host, доменов, TLS/SSO и внешних live URL. Локальный preview защищён Basic Auth и proxy `X-Robots-Tag`; GitHub remote, Actions, GHCR и environments настроены.
- Локальный контейнерный bootstrap выполнен и проверен; внешний production host всё ещё отсутствует.
- Directus schema snapshot и две read-only renderer policies экспортируются воспроизводимо. Public credential не читает исходные content-коллекции и `language_versions`: он получает только транзакционно синхронизируемые PostgreSQL-коллекции `published_*`. Preview credential читает исходные строки и draft snapshots. Решение закрывает published-only boundary в Directus Core 12.1.1 без лицензируемых custom item rules; оба локальных контура привязаны к loopback.
- Directus обновлён до 12.1.1 после локальной проверки миграции. До production требуется отдельное подтверждение применимости Core tier/лицензии и повторная проверка актуальных условий.
- Демонстрационная форма не отправляет и не сохраняет персональные данные.
- Нет webhook, автоматически создающего PR из content-only change; ChangeTask связывает два процесса вручную.
- Backup/restore проверен на отдельной временной БД; аварийный restore рабочей production-БД не выполнялся.
- Производный PostgreSQL image содержит только замену `gosu` на Alpine `su-exec`; его необходимо пересобирать при каждом обновлении закреплённого upstream digest.
- Контент fixture — новый нейтральный пилот, не юридически утверждённый перенос Wix.
- CI fixture синхронизирован с локальным Directus: 8 published pages, public v3 и append-only preview rollback v6 проходят общий renderer-контракт.
- Directus-originated REST write и append-only rollback v6 подтверждены; автоматический UI/webhook trigger остаётся задачей следующего этапа.

## Следующий этап

1. Перед внешним deployment заменить локальный Basic Auth на SSO или отдельный managed secret и повторить raw-header verification на TLS hostname.
2. Подключить управляемый PostgreSQL, object storage и автоматические encrypted backups с restore drill.
3. Поднять preview/production domains, TLS и GitHub environments.
4. Добавить Directus webhook → signed build trigger и content change manifest.
5. Провести редакторскую и юридическую проверку PL/RU, accessibility audit и performance budgets.
6. Добавить observability, uptime check и проверяемый incident/rollback runbook.
