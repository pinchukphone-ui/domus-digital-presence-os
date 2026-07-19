# Acceptance-аудит первого этапа

Дата readback: 2026-07-19. Проверяемый commit `main`: `cab0fc344caca3d06e31c2d2d67b61633cd77d09`.

## Итог

Локальный production-like vertical slice условно принят. PostgreSQL, Directus и два Astro runtime воспроизводятся через Docker Compose; public и preview используют разные read-only credentials; PL/RU hub, SEO, draft preview, CI, backup/restore и PR workflow подтверждены.

Внешний release не входит в текущую приёмку по решению владельца: VPS, домены, TLS, стабильные внешние URL и production rollback по digest намеренно не создавались. Fixture/Directus parity закрыта общим renderer-контрактом и E2E. До закрытия оставшегося локального пробела нельзя считать демонстрационный цикл полностью воспроизводимым только по CI:

1. контентный цикл доказан транзакционными SQL/change manifests, но входящее изменение через Directus API/UI ещё не продемонстрировано.

## Матрица десяти задач

| Задача | Статус | Evidence и граница |
| --- | --- | --- |
| 1. Технический аудит | Принято | `current-state.md`, `vertical-slice-plan.md`, pnpm workspace, GitHub/GHCR и локальные команды подтверждены. Внешний deployment отсутствует намеренно. |
| 2. Архитектурный каркас | Принято | `apps`, `packages`, `infrastructure`, `docs`; девять content collections; микросервисы не добавлены. |
| 3. Локальный стек | Принято | PostgreSQL, Directus, public и preview healthy; `.env.example`, migrations, seed, health checks, backup/restore. В Git отслеживается только `.env.example`. |
| 4. Модель данных | Принято | Hub, Page, ContentBlock, LanguageVersion, Service, CTA, InternalLink, MediaAsset, ChangeTask; `pl`/`ru`; отдельные строки страниц и UUID `translation_group`. |
| 5. Тестовый hub | Принято с ограничением | 1 hub, 8 страниц (4 PL + 4 RU), 2 service records, 2 CTA, calculator, demo form и внутренние связи. `media_assets` поддерживается схемой, но пилотная запись не создана. |
| 6. Public frontend | Принято | Directus REST, Astro SSR, маршруты, title/description, canonical, hreflang, breadcrumbs, links, runtime sitemap, responsive CSS и React island. |
| 7. Preview | Локально принято | Один renderer, v4 draft видна только в preview, meta `noindex,nofollow,noarchive`; preview sitemap закрыт. Внешние auth и proxy `X-Robots-Tag` отложены до deployment. |
| 8. Codex workflow | Принято как процесс | Короткий `AGENTS.md`, Architect/Builder/Reviewer и verification skills; branch + PR используется. Branch protection требует PR и актуальный `validate`; GitHub-native обязательный approval сейчас не настроен. |
| 9. Автопроверки | Принято | Typecheck, lint, 26 unit tests, schema/content/link/SEO/hreflang validation, build и 6 E2E проходят. Fixture и Directus моделируют одну пару public v3 / preview v4. |
| 10. Демонстрационный цикл | Частично принято | Version/change task, preview, PR, review, merge, local promotion, verification и DB restore drill доказаны. Directus-originated write — пробел A2; внешний deployment/rollback отложены. |

## Итоговые материалы

| Материал | Состояние |
| --- | --- |
| Структура, архитектурная схема и модель данных | В Git, подтверждены |
| Команды запуска и deployment instructions | В Git, локальные команды проверены |
| Результаты тестов | `pnpm validate`, 26/26 unit, 6/6 E2E; локальный Directus readback green |
| Preview URL | Только локальный: `http://localhost:4322/ru/ipoteka/konsultaciya` |
| Production pilot URL | Только локальный public: `http://localhost:4321/pl/kredyty-hipoteczne`; внешнего URL нет |
| Rollback | DB restore drill подтверждён; внешний image rollback невозможен до первого deployment |
| Ограничения и следующий этап | `limitations-and-next-stage.md` и backlog ниже |

## Локальные closure-задачи

### A1. Закрыто: CI fixture синхронизирован с version-aware состоянием

Роль: Builder. Один PR.

- Fixture должен моделировать published v3 отдельно от draft snapshot v4.
- Public E2E проверяет 8 published URL, v3, sitemap и полный PL/RU hreflang.
- Preview E2E проверяет v4 banner/text и отсутствие v4 в public.
- Directus adapter и fixture должны проходить один общий контрактный набор тестов.
- Rollback: revert PR; локальная БД не изменяется.

Readback: public fixture содержит 8 published страниц и v3; preview накладывает отдельный v4 snapshot. 26/26 unit, 6/6 E2E и live Directus public v3 / preview v4 прошли.

### A2. Доказать Directus-originated content change

Роль: Builder, затем независимый Reviewer. Один PR и отдельное локальное выполнение после approval.

- Добавить воспроизводимый operator script, который через Directus REST создаёт новую draft `language_versions` и связанную `change_tasks`, не меняя published page/blocks.
- Credential остаётся server-side; admin token не попадает в Git, image или браузер.
- Перед выполнением создать backup; после записи прочитать API/DB state, public unchanged и preview candidate.
- Скрипт и тест используют нейтральный текст без юридических утверждений и персональных данных.
- Rollback создаёт следующую revision из предыдущего полного snapshot; история не переписывается.

После A2 повторить `pnpm validate`, E2E против fixture и live Directus, backup/restore readback и обновить эту матрицу на `Принято локально`.

## Backlog перед внешним pilot

Каждый пункт — отдельная Builder-задача и PR:

1. Preview authentication и reverse-proxy `X-Robots-Tag` с проверкой raw headers.
2. Published-only enforcement на уровне Directus API/view или подтверждённого лицензированного permission tier.
3. Hetzner/Caddy provisioning, TLS, domains и environment-scoped SSH secrets.
4. Off-host encrypted database/uploads backup с retention и restore drill.
5. Редакторская/юридическая PL/RU проверка, accessibility audit и performance budgets.
6. Health/uptime monitoring, логи, alert routing и incident/rollback rehearsal.

Включение `DEPLOYMENT_ENABLED=true` и production deployment остаются отдельным решением владельца после Reviewer `Approved`.
