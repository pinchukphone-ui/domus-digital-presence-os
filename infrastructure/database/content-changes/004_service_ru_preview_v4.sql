BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pages AS page
    JOIN content_blocks AS block ON block.page_id = page.id AND block.id = 'service-body-ru'
    JOIN language_versions AS published ON published.page_id = page.id AND published.version = 3
    WHERE page.id = 'service-ru'
      AND page.status = 'published'
      AND published.status = 'published'
      AND block.body = published.snapshot #>> '{blocks,0,body}'
  ) THEN
    RAISE EXCEPTION 'service-ru published version 3 is required before preparing preview version 4';
  END IF;
END $$;

INSERT INTO language_versions (page_id, version, status, snapshot)
SELECT
  published.page_id,
  4,
  'draft',
  jsonb_set(
    jsonb_set(published.snapshot, '{page,status}', '"published"'::jsonb),
    '{blocks,0,body}',
    to_jsonb('Черновик версии 4: демонстрационная форма не отправляет данные. Перед публикацией требуется отдельная проверка текста, согласий и политики конфиденциальности.'::text)
  )
FROM language_versions AS published
WHERE published.page_id = 'service-ru'
  AND published.version = 3
  AND published.status = 'published'
ON CONFLICT (page_id, version) DO NOTHING;

INSERT INTO change_tasks (
  id,
  title,
  scope,
  status,
  target_page_id,
  base_version,
  candidate_version,
  preview_url,
  rollback_reference
)
VALUES (
  '9a1d266c-9158-4ced-8294-64141e2834bb',
  'Preview Russian consultation version 4',
  'Draft snapshot overlay only; published page and blocks remain on version 3',
  'in_review',
  'service-ru',
  3,
  4,
  'http://localhost:4322/ru/ipoteka/konsultaciya',
  'language_versions:service-ru:3'
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pages AS page
    JOIN content_blocks AS block ON block.page_id = page.id AND block.id = 'service-body-ru'
    JOIN language_versions AS published ON published.page_id = page.id AND published.version = 3
    JOIN language_versions AS candidate ON candidate.page_id = page.id AND candidate.version = 4
    JOIN change_tasks AS task ON task.id = '9a1d266c-9158-4ced-8294-64141e2834bb'
    WHERE page.id = 'service-ru'
      AND page.status = 'published'
      AND published.status = 'published'
      AND candidate.status = 'draft'
      AND candidate.snapshot #>> '{page,id}' = page.id
      AND candidate.snapshot #>> '{blocks,0,body}' = 'Черновик версии 4: демонстрационная форма не отправляет данные. Перед публикацией требуется отдельная проверка текста, согласий и политики конфиденциальности.'
      AND block.body = published.snapshot #>> '{blocks,0,body}'
      AND block.body <> candidate.snapshot #>> '{blocks,0,body}'
      AND task.status = 'in_review'
      AND task.base_version = 3
      AND task.candidate_version = 4
      AND task.rollback_reference = 'language_versions:service-ru:3'
  ) THEN
    RAISE EXCEPTION 'service-ru version 4 preview boundary is invalid';
  END IF;
END $$;

COMMIT;
