BEGIN;

DO $$
DECLARE
  current_body text;
  baseline_body constant text := 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.';
  candidate_body constant text := 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.';
BEGIN
  SELECT body INTO current_body
  FROM content_blocks
  WHERE id = 'service-body-ru' AND page_id = 'service-ru';

  IF current_body IS NULL THEN
    RAISE EXCEPTION 'service-body-ru is missing';
  END IF;

  IF current_body NOT IN (baseline_body, candidate_body) THEN
    RAISE EXCEPTION 'service-body-ru has an unexpected body and requires manual review';
  END IF;

  IF current_body = candidate_body AND NOT EXISTS (
    SELECT 1 FROM language_versions WHERE page_id = 'service-ru' AND version = 2
  ) THEN
    RAISE EXCEPTION 'candidate content exists without the immutable version 2 rollback baseline';
  END IF;
END $$;

INSERT INTO language_versions (page_id, version, status, snapshot)
SELECT
  page.id,
  2,
  'draft',
  jsonb_build_object(
    'schema_version', 1,
    'page', jsonb_build_object(
      'id', page.id,
      'hub_id', page.hub_id,
      'translation_group', page.translation_group,
      'language', page.language,
      'slug', page.slug,
      'canonical_path', page.canonical_path,
      'page_type', page.page_type,
      'status', page.status,
      'title', page.title,
      'meta_description', page.meta_description
    ),
    'blocks', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', block.id,
            'kind', block.kind,
            'sort', block.sort,
            'heading', block.heading,
            'body', block.body,
            'data', block.data
          ) ORDER BY block.sort
        ),
        '[]'::jsonb
      )
      FROM content_blocks AS block
      WHERE block.page_id = page.id
    )
  )
FROM pages AS page
WHERE page.id = 'service-ru'
  AND EXISTS (
    SELECT 1
    FROM content_blocks
    WHERE id = 'service-body-ru'
      AND page_id = page.id
      AND body = 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.'
  )
ON CONFLICT (page_id, version) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM language_versions
    WHERE page_id = 'service-ru'
      AND version = 2
      AND snapshot #>> '{blocks,0,body}' = 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.'
  ) THEN
    RAISE EXCEPTION 'language_versions service-ru v2 is not a valid rollback baseline';
  END IF;
END $$;

UPDATE content_blocks
SET body = 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.'
WHERE id = 'service-body-ru'
  AND page_id = 'service-ru'
  AND body = 'Демонстрационная форма не отправляет данные. Интеграция требует отдельной задачи и политики конфиденциальности.';

INSERT INTO language_versions (page_id, version, status, snapshot)
SELECT
  page.id,
  3,
  'draft',
  jsonb_build_object(
    'schema_version', 1,
    'page', jsonb_build_object(
      'id', page.id,
      'hub_id', page.hub_id,
      'translation_group', page.translation_group,
      'language', page.language,
      'slug', page.slug,
      'canonical_path', page.canonical_path,
      'page_type', page.page_type,
      'status', page.status,
      'title', page.title,
      'meta_description', page.meta_description
    ),
    'blocks', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', block.id,
            'kind', block.kind,
            'sort', block.sort,
            'heading', block.heading,
            'body', block.body,
            'data', block.data
          ) ORDER BY block.sort
        ),
        '[]'::jsonb
      )
      FROM content_blocks AS block
      WHERE block.page_id = page.id
    )
  )
FROM pages AS page
WHERE page.id = 'service-ru'
  AND EXISTS (
    SELECT 1
    FROM content_blocks
    WHERE id = 'service-body-ru'
      AND page_id = page.id
      AND body = 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.'
  )
ON CONFLICT (page_id, version) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM language_versions
    WHERE page_id = 'service-ru'
      AND version = 3
      AND snapshot #>> '{blocks,0,body}' = 'Демонстрационная форма не отправляет данные. Рабочая интеграция требует отдельной задачи, согласий и политики конфиденциальности.'
  ) THEN
    RAISE EXCEPTION 'language_versions service-ru v3 is not a valid candidate snapshot';
  END IF;
END $$;

UPDATE change_tasks
SET
  status = 'in_review',
  base_version = 2,
  candidate_version = 3,
  rollback_reference = 'language_versions:service-ru:2',
  updated_at = now()
WHERE target_page_id = 'service-ru'
  AND title = 'Publish Russian mortgage consultation'
  AND status IN ('draft', 'in_review');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM change_tasks
    WHERE target_page_id = 'service-ru'
      AND title = 'Publish Russian mortgage consultation'
      AND status = 'in_review'
      AND base_version = 2
      AND candidate_version = 3
      AND rollback_reference = 'language_versions:service-ru:2'
  ) THEN
    RAISE EXCEPTION 'service-ru change task was not prepared for review';
  END IF;

  IF EXISTS (SELECT 1 FROM pages WHERE id = 'service-ru' AND status <> 'draft') THEN
    RAISE EXCEPTION 'service-ru must remain draft until Reviewer approval';
  END IF;
END $$;

COMMIT;
