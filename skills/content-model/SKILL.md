---
name: content-model
description: Change the Directus/PostgreSQL content model safely and compatibly.
---

# Content model

- Одна языковая страница — одна запись `pages`; переводы связывает `translation_group`.
- Поддерживаемые языки на этапе 1: только `pl`, `ru`.
- Миграция должна быть детерминированной; destructive change требует backup и обратного пути.
- Сохраняй историю в `language_versions`, изменение — в `change_tasks`.
- Проверяй fixture, SQL constraints и Directus REST adapter вместе.

