BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pages AS page
    JOIN content_blocks AS block ON block.page_id = page.id AND block.id = 'service-body-ru'
    JOIN language_versions AS baseline ON baseline.page_id = page.id AND baseline.version = 2
    JOIN language_versions AS candidate ON candidate.page_id = page.id AND candidate.version = 3
    JOIN change_tasks AS task ON task.target_page_id = page.id AND task.candidate_version = 3
    WHERE page.id = 'service-ru'
      AND page.status IN ('draft', 'published')
      AND candidate.status IN ('draft', 'published')
      AND task.status IN ('in_review', 'approved')
      AND task.base_version = 2
      AND task.rollback_reference = 'language_versions:service-ru:2'
      AND baseline.snapshot #>> '{blocks,0,body}' = 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.'
      AND candidate.snapshot #>> '{blocks,0,body}' = 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.'
      AND block.body = candidate.snapshot #>> '{blocks,0,body}'
  ) THEN
    RAISE EXCEPTION 'service-ru is not in an approved version 3 publication state';
  END IF;
END $$;

UPDATE language_versions
SET status = 'published'
WHERE page_id = 'service-ru'
  AND version = 3
  AND status = 'draft';

UPDATE pages
SET status = 'published', updated_at = now()
WHERE id = 'service-ru'
  AND status = 'draft';

UPDATE change_tasks
SET
  status = 'approved',
  production_url = 'http://localhost:4321/ru/ipoteka/konsultaciya',
  updated_at = now()
WHERE target_page_id = 'service-ru'
  AND candidate_version = 3
  AND status = 'in_review';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pages AS page
    JOIN language_versions AS candidate ON candidate.page_id = page.id AND candidate.version = 3
    JOIN change_tasks AS task ON task.target_page_id = page.id AND task.candidate_version = 3
    WHERE page.id = 'service-ru'
      AND page.status = 'published'
      AND candidate.status = 'published'
      AND task.status = 'approved'
      AND task.production_url = 'http://localhost:4321/ru/ipoteka/konsultaciya'
      AND task.rollback_reference = 'language_versions:service-ru:2'
  ) THEN
    RAISE EXCEPTION 'service-ru local publication did not reach the approved state';
  END IF;
END $$;

COMMIT;
