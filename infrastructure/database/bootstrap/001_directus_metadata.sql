\getenv frontend_token DIRECTUS_FRONTEND_TOKEN
\if :{?frontend_token}
\else
  \echo 'DIRECTUS_FRONTEND_TOKEN is required'
  \quit 3
\endif

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

INSERT INTO directus_roles (id, name, icon, description)
VALUES (
  '31ff6ef4-7e93-445a-9d7e-2f3e160c257e',
  'DOMUS Frontend',
  'language',
  'Server-side public and preview rendering; no Data Studio access'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

INSERT INTO directus_policies
  (id, name, icon, description, enforce_tfa, admin_access, app_access)
VALUES (
  'abfd2755-dd92-43cb-b016-3fabd5d49cd0',
  'DOMUS Frontend Read',
  'visibility',
  'Read-only access to collections required by Astro rendering',
  false,
  false,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  enforce_tfa = false,
  admin_access = false,
  app_access = false;

INSERT INTO directus_access (id, role, policy, sort)
VALUES (
  '619cc573-b8c4-4f87-9e6b-08acbb625e8a',
  '31ff6ef4-7e93-445a-9d7e-2f3e160c257e',
  'abfd2755-dd92-43cb-b016-3fabd5d49cd0',
  1
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  policy = EXCLUDED.policy,
  sort = EXCLUDED.sort;

INSERT INTO directus_users
  (id, first_name, last_name, email, status, role, token, provider, email_notifications, text_direction)
VALUES (
  '261d41fb-af8c-4596-8758-fc1cf52e061e',
  'DOMUS',
  'Frontend',
  'frontend-service@domus.local',
  'active',
  '31ff6ef4-7e93-445a-9d7e-2f3e160c257e',
  :'frontend_token',
  'default',
  false,
  'auto'
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  status = 'active',
  role = EXCLUDED.role,
  token = EXCLUDED.token,
  email_notifications = false;

DELETE FROM directus_permissions
WHERE policy = 'abfd2755-dd92-43cb-b016-3fabd5d49cd0';

INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
SELECT
  'abfd2755-dd92-43cb-b016-3fabd5d49cd0',
  collection,
  'read',
  NULL,
  NULL,
  NULL,
  '*'
FROM (VALUES
  ('pages'),
  ('content_blocks'),
  ('internal_links'),
  ('ctas')
) AS frontend_collections(collection);

COMMIT;
