# Демонстрационный сценарий

1. В Directus откройте `service-ru`, не меняя `status=draft`; создайте `language_versions.version=2` и обновите текст.
2. Обновите соответствующий `change_tasks`: `base_version=1`, `candidate_version=2`, `status=in_review`.
3. Откройте стабильный preview URL `/ru/ipoteka/konsultaciya`; подтвердите новый текст и `noindex`. В production страница должна отсутствовать.
4. Если менялась схема/renderer, Builder создаёт branch и PR. Для content-only change PR содержит экспортируемый change manifest, не секреты/полный dump.
5. Reviewer возвращает один статус. Только `Approved` разрешает merge/промоут версии.
6. После merge и environment approval поменяйте статус страницы на `published`, разверните SHA/digest.
7. Выполните live SEO, link, hreflang и smoke checks; запишите production URL/digest/version.
8. Демонстрация rollback: верните предыдущий image digest, а контент — новым revision из snapshot v1. Повторите readback.

Локальный Directus содержит исходное состояние: `service-ru` draft видна в preview и исключена из production. Backup восстановлен в отдельную временную БД с readback `7 published + 1 draft`; временная БД после drill удалена. Реальная внешняя публикация не выполнялась.

