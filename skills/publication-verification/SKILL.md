---
name: publication-verification
description: Verify preview, production and rollback as distinct observable states.
---

# Publication verification

1. Запиши content version, commit SHA и image digest.
2. Preview: стабильный URL, auth boundary, draft виден, meta и proxy `noindex`.
3. Production: опубликованная версия видна по canonical URL; draft отсутствует.
4. Выполни smoke/E2E против live URL.
5. Rollback: разверни предыдущий digest и/или восстанови content version; повтори live-проверку.
6. Не называй build/deploy успешной публикацией без live readback.

