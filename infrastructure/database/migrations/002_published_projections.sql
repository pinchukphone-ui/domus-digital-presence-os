BEGIN;

-- Directus Core does not provide item-level permission rules in this deployment.
-- These physical, read-only API projections give the public renderer a hard
-- published-only boundary while preview continues to read the source tables.
CREATE TABLE published_pages (LIKE pages INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
CREATE TABLE published_content_blocks (LIKE content_blocks INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
CREATE TABLE published_ctas (LIKE ctas INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);
CREATE TABLE published_internal_links (LIKE internal_links INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);

CREATE OR REPLACE FUNCTION refresh_published_projections()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM published_internal_links;
  DELETE FROM published_ctas;
  DELETE FROM published_content_blocks;
  DELETE FROM published_pages;

  INSERT INTO published_pages
  SELECT page.*
  FROM pages AS page
  WHERE page.status = 'published';

  INSERT INTO published_content_blocks
  SELECT block.*
  FROM content_blocks AS block
  JOIN pages AS page ON page.id = block.page_id
  WHERE page.status = 'published';

  INSERT INTO published_ctas
  SELECT cta.*
  FROM ctas AS cta
  JOIN pages AS page ON page.id = cta.page_id
  WHERE page.status = 'published';

  INSERT INTO published_internal_links
  SELECT link.*
  FROM internal_links AS link
  JOIN pages AS source_page ON source_page.id = link.source_page_id
  JOIN pages AS target_page ON target_page.id = link.target_page_id
  WHERE source_page.status = 'published'
    AND target_page.status = 'published';

  RETURN NULL;
END;
$$;

CREATE TRIGGER refresh_published_pages
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON pages
FOR EACH STATEMENT EXECUTE FUNCTION refresh_published_projections();

CREATE TRIGGER refresh_published_blocks
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON content_blocks
FOR EACH STATEMENT EXECUTE FUNCTION refresh_published_projections();

CREATE TRIGGER refresh_published_ctas
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON ctas
FOR EACH STATEMENT EXECUTE FUNCTION refresh_published_projections();

CREATE TRIGGER refresh_published_links
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON internal_links
FOR EACH STATEMENT EXECUTE FUNCTION refresh_published_projections();

INSERT INTO published_pages
SELECT page.* FROM pages AS page WHERE page.status = 'published';

INSERT INTO published_content_blocks
SELECT block.*
FROM content_blocks AS block
JOIN pages AS page ON page.id = block.page_id
WHERE page.status = 'published';

INSERT INTO published_ctas
SELECT cta.*
FROM ctas AS cta
JOIN pages AS page ON page.id = cta.page_id
WHERE page.status = 'published';

INSERT INTO published_internal_links
SELECT link.*
FROM internal_links AS link
JOIN pages AS source_page ON source_page.id = link.source_page_id
JOIN pages AS target_page ON target_page.id = link.target_page_id
WHERE source_page.status = 'published'
  AND target_page.status = 'published';

COMMIT;
