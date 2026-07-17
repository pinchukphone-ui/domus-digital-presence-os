BEGIN;

INSERT INTO directus_collections
  (collection, icon, note, display_template, hidden, singleton, archive_field, archive_value, unarchive_value, sort, collapse)
VALUES
  ('hubs', 'hub', 'Multilingual content hubs', '{{name}}', false, false, 'status', 'archived', 'draft', 1, 'open'),
  ('pages', 'article', 'One record per language; paired by translation_group', '{{title}}', false, false, 'status', 'archived', 'draft', 2, 'open'),
  ('content_blocks', 'view_agenda', 'Ordered page content blocks', '{{heading}}', false, false, null, null, null, 3, 'open'),
  ('language_versions', 'history', 'Immutable page-version snapshots', '{{page_id}} v{{version}}', false, false, 'status', 'archived', 'draft', 4, 'open'),
  ('services', 'support_agent', 'Localized DOMUS services', '{{name}}', false, false, null, null, null, 5, 'open'),
  ('ctas', 'ads_click', 'Localized calls to action', '{{label}}', false, false, null, null, null, 6, 'open'),
  ('internal_links', 'link', 'Explicit internal-link graph', '{{label}}', false, false, null, null, null, 7, 'open'),
  ('media_assets', 'perm_media', 'Media metadata and rights source', '{{id}}', false, false, null, null, null, 8, 'open'),
  ('change_tasks', 'task_alt', 'Auditable content and deployment changes', '{{title}}', false, false, null, null, null, 9, 'open')
ON CONFLICT (collection) DO UPDATE SET
  icon = EXCLUDED.icon,
  note = EXCLUDED.note,
  display_template = EXCLUDED.display_template,
  archive_field = EXCLUDED.archive_field,
  archive_value = EXCLUDED.archive_value,
  unarchive_value = EXCLUDED.unarchive_value,
  sort = EXCLUDED.sort;

COMMIT;
