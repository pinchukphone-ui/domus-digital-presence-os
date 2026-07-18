\getenv public_token DIRECTUS_PUBLIC_TOKEN
\if :{?public_token}
\else
  \echo 'DIRECTUS_PUBLIC_TOKEN is required'
  \quit 3
\endif
\getenv preview_token DIRECTUS_PREVIEW_TOKEN
\if :{?preview_token}
\else
  \echo 'DIRECTUS_PREVIEW_TOKEN is required'
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
  '5367c7ad-78b8-4a93-9059-0c5eafc55b21',
  'DOMUS Public Renderer',
  'language',
  'Server-side published-content rendering; no Data Studio access'
),
(
  '42a6e783-13fb-4e5c-bd4b-a02ad59e67ae',
  'DOMUS Preview Renderer',
  'preview',
  'Server-side draft preview rendering; no Data Studio access'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

INSERT INTO directus_policies
  (id, name, icon, description, enforce_tfa, admin_access, app_access)
VALUES (
  'cd1a1d45-086a-4d18-a5ae-44d0066e47e4',
  'DOMUS Public Read',
  'visibility',
  'Read-only public renderer access; version snapshots excluded',
  false,
  false,
  false
),
(
  'bc52e31f-aa95-4ca3-b624-7011a2764b92',
  'DOMUS Preview Read',
  'preview',
  'Read-only access to published and draft Astro content snapshots',
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
  '83db78fd-02cb-4055-a710-c9d71424ecf5',
  '5367c7ad-78b8-4a93-9059-0c5eafc55b21',
  'cd1a1d45-086a-4d18-a5ae-44d0066e47e4',
  1
),
(
  '72d6e9ba-c4dc-43ad-83d2-1d38fc816a5a',
  '42a6e783-13fb-4e5c-bd4b-a02ad59e67ae',
  'bc52e31f-aa95-4ca3-b624-7011a2764b92',
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
  'Public Renderer',
  'public-renderer@domus.local',
  'active',
  '5367c7ad-78b8-4a93-9059-0c5eafc55b21',
  :'public_token',
  'default',
  false,
  'auto'
),
(
  '37dd3ba5-abf4-47c3-bd74-854cb379ca6a',
  'DOMUS',
  'Preview Renderer',
  'preview-renderer@domus.local',
  'active',
  '42a6e783-13fb-4e5c-bd4b-a02ad59e67ae',
  :'preview_token',
  'default',
  false,
  'auto'
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  status = 'active',
  role = EXCLUDED.role,
  token = EXCLUDED.token,
  email_notifications = false;

DELETE FROM directus_permissions
WHERE policy IN (
  'abfd2755-dd92-43cb-b016-3fabd5d49cd0',
  'cd1a1d45-086a-4d18-a5ae-44d0066e47e4',
  'bc52e31f-aa95-4ca3-b624-7011a2764b92'
);

INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
VALUES
  ('cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'pages', 'read', NULL, NULL, NULL, '*'),
  ('cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'content_blocks', 'read', NULL, NULL, NULL, '*'),
  ('cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'internal_links', 'read', NULL, NULL, NULL, '*'),
  ('cd1a1d45-086a-4d18-a5ae-44d0066e47e4', 'ctas', 'read', NULL, NULL, NULL, '*');

INSERT INTO directus_permissions (policy, collection, action, permissions, validation, presets, fields)
SELECT
  'bc52e31f-aa95-4ca3-b624-7011a2764b92',
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
  ('ctas'),
  ('language_versions')
) AS preview_collections(collection);

DELETE FROM directus_access
WHERE id = '619cc573-b8c4-4f87-9e6b-08acbb625e8a';

DELETE FROM directus_access
WHERE id = '94b31787-4727-49b4-9c39-39a0caeff1a0';

DELETE FROM directus_policies
WHERE id = 'abfd2755-dd92-43cb-b016-3fabd5d49cd0';

DELETE FROM directus_roles
WHERE id = '31ff6ef4-7e93-445a-9d7e-2f3e160c257e';

COMMIT;
