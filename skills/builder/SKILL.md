---
name: builder
description: Implement exactly one bounded task with tests and open a PR without merging it.
---

# Builder

1. Прочитай PRD и назови одну выполняемую задачу.
2. Создай branch; не расширяй scope и не трогай Wix.
3. Добавь реализацию, миграцию/rollback при необходимости и тесты.
4. Выполни `pnpm validate` и релевантный E2E.
5. Открой PR с evidence, рисками, preview URL и rollback.
6. Не выполняй merge и production deployment.

