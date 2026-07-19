# Демонстрационный сценарий

1. Не переписывая исходную неполную версию 1, примените `002_service_ru_review.sql`: скрипт сохраняет полный rollback snapshot как `language_versions.version=2`, обновляет текст и сохраняет полный candidate snapshot как версию 3. `service-ru` остаётся `draft`.
2. Скрипт обновляет соответствующий `change_tasks`: `base_version=2`, `candidate_version=3`, `status=in_review`, `rollback_reference=language_versions:service-ru:2`. Сверьте состояние с `change-manifests/service-ru-v3.json`.
3. Откройте стабильный preview URL `/ru/ipoteka/konsultaciya`; подтвердите новый текст и `noindex`. В production страница должна отсутствовать.
4. Если менялась схема/renderer, Builder создаёт branch и PR. Для content-only change PR содержит экспортируемый change manifest, не секреты/полный dump.
5. Reviewer возвращает один статус. Только `Approved` разрешает merge/промоут версии.
6. После merge и Reviewer approval выполните `pnpm db:publish-service-ru-local`. Команда транзакционно публикует версию 3 только в локальном public-контуре; внешний deployment остаётся выключен.
7. Выполните live SEO, link, hreflang и smoke checks; запишите local public URL, SHA, digest и version. Статус `deployed` используйте только после отдельного внешнего deployment.
8. Демонстрация rollback: верните предыдущий image digest, а контент — новым revision из полного snapshot v2. Повторите readback.

Локальный Directus содержит исходное состояние: `service-ru` draft видна в preview и исключена из production. Backup восстановлен в отдельную временную БД с readback `7 published + 1 draft`; временная БД после drill удалена. Реальная внешняя публикация не выполнялась.

## Следующий черновик после локальной публикации

После публикации v3 выполните `pnpm db:prepare-service-ru-preview-v4`. Команда добавляет только immutable snapshot v4 и отдельный `ChangeTask`; `pages` и `content_blocks` остаются на published v3. Public URL продолжает показывать v3 и не запрашивает `language_versions`, а тот же путь на preview URL показывает v4, banner `PREVIEW · v4` и `noindex`. Сверьте границу с `change-manifests/service-ru-preview-v4.json`. Публикация v4 и внешний deployment требуют отдельных задач.

## Directus-originated REST drill

После отдельного PR/review выполните v5 и rollback v6 командами из `local-development.md`. В отличие от ранних SQL content changes, обе revisions и связанные `ChangeTask` создаются через Directus REST. V5 содержит только нейтральный технический текст; v6 append-only восстанавливает полный v4 snapshot. Ни одна команда не изменяет published `pages`/`content_blocks`, не удаляет историю и не включает внешний deployment.
