BEGIN;

CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE content_language AS ENUM ('pl', 'ru');
CREATE TYPE page_kind AS ENUM ('hub', 'article', 'service');
CREATE TYPE block_kind AS ENUM ('hero', 'rich_text', 'service', 'calculator', 'cta');

CREATE TABLE hubs (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE pages (
  id text PRIMARY KEY,
  hub_id text NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  translation_group uuid NOT NULL,
  language content_language NOT NULL,
  slug text NOT NULL,
  canonical_path text NOT NULL UNIQUE CHECK (canonical_path LIKE '/%'),
  page_type page_kind NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  meta_description text NOT NULL CHECK (char_length(meta_description) BETWEEN 50 AND 170),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (translation_group, language),
  UNIQUE (language, slug)
);
CREATE INDEX pages_publication_idx ON pages (status, language, slug);
CREATE INDEX pages_translation_idx ON pages (translation_group);

CREATE TABLE language_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version > 0),
  status content_status NOT NULL DEFAULT 'draft',
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, version)
);

CREATE TABLE content_blocks (
  id text PRIMARY KEY,
  page_id text NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  kind block_kind NOT NULL,
  sort integer NOT NULL DEFAULT 0,
  heading text,
  body text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (page_id, sort)
);

CREATE TABLE services (
  id text PRIMARY KEY,
  key text NOT NULL,
  language content_language NOT NULL,
  page_id text NOT NULL REFERENCES pages(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text NOT NULL,
  UNIQUE (key, language)
);

CREATE TABLE ctas (
  id text PRIMARY KEY,
  page_id text NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL CHECK (href LIKE '/%'),
  style text NOT NULL DEFAULT 'primary' CHECK (style IN ('primary', 'secondary'))
);

CREATE TABLE internal_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_page_id text NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  target_page_id text NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL CHECK (href LIKE '/%'),
  relation text NOT NULL DEFAULT 'related' CHECK (relation IN ('child', 'related', 'service')),
  CHECK (source_page_id <> target_page_id),
  UNIQUE (source_page_id, target_page_id, label)
);

CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directus_file_id uuid,
  alt_pl text,
  alt_ru text,
  rights_source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE change_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  scope text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'deployed', 'rolled_back', 'rejected')),
  target_page_id text REFERENCES pages(id) ON DELETE SET NULL,
  base_version integer,
  candidate_version integer,
  pull_request_url text,
  preview_url text,
  production_url text,
  rollback_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

