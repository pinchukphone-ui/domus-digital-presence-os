BEGIN;

INSERT INTO media_assets (id, directus_file_id, alt_pl, alt_ru, rights_source)
VALUES (
  '55555555-5555-4555-8555-555555555555',
  NULL,
  'Znak słowny DOMUS GLOBAL',
  'Текстовый логотип DOMUS GLOBAL',
  'DOMUS-owned wordmark; local pilot metadata'
)
ON CONFLICT (id) DO UPDATE SET
  alt_pl = EXCLUDED.alt_pl,
  alt_ru = EXCLUDED.alt_ru,
  rights_source = EXCLUDED.rights_source;

COMMIT;
