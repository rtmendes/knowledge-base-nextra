-- ─────────────────────────────────────────────────────────────────────────
-- KB Enrichment Migration — Chief of Staff retrieval quality
-- ─────────────────────────────────────────────────────────────────────────
-- Purpose: upgrade knowledge_items search from naive ILIKE to weighted
-- Postgres FTS with native ranking, and add an entity dictionary for
-- alias/synonym expansion. Idempotent — safe to run multiple times.
--
-- Tables touched:
--   - knowledge_items (ADD: brand, summary, search_doc tsvector + GIN index)
--   - kb_entities (NEW: alias dictionary for query expansion)
--   - kb_search_feedback (NEW: click logging for learning-to-rank later)
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Enrich knowledge_items
ALTER TABLE knowledge_items
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS summary text;

-- Generated tsvector — title weighted highest (A), then tags (B), then content (C).
-- The 'english' config handles stemming: "design" matches "designs", "designing".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_items' AND column_name = 'search_doc'
  ) THEN
    EXECUTE $sql$
      ALTER TABLE knowledge_items
      ADD COLUMN search_doc tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(brand, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content_plain, '')), 'C')
      ) STORED
    $sql$;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS knowledge_items_search_doc_idx
  ON knowledge_items USING GIN (search_doc);

CREATE INDEX IF NOT EXISTS knowledge_items_brand_idx
  ON knowledge_items (brand) WHERE brand IS NOT NULL;

COMMENT ON COLUMN knowledge_items.brand IS
  'Which product line this belongs to. Examples: fgs, apex, closeflow, elitewriter, vidrevamp, command, shared.';
COMMENT ON COLUMN knowledge_items.summary IS
  '<=200 char abstract used for embeddings + Chief of Staff context. Cheaper to embed than full content.';
COMMENT ON COLUMN knowledge_items.search_doc IS
  'Weighted tsvector: title+brand (A) > tags+summary (B) > content (C). Query via @@ tsquery.';

-- 2. Entity dictionary — query expansion source of truth
CREATE TABLE IF NOT EXISTS kb_entities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical    text NOT NULL,
  aliases      text[] NOT NULL DEFAULT '{}',
  entity_type  text NOT NULL,
  -- For app entities: link to app_catalog by subdomain
  related_subdomain text,
  -- For brand entities: which apps belong to this brand
  related_apps text[],
  -- Higher = preferred when multiple entities match a token
  authority_score int NOT NULL DEFAULT 50,
  -- Embedded notes — what is this thing? Used in expansion responses.
  description text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS kb_entities_canonical_idx
  ON kb_entities (lower(canonical));
CREATE INDEX IF NOT EXISTS kb_entities_aliases_gin
  ON kb_entities USING GIN (aliases);
CREATE INDEX IF NOT EXISTS kb_entities_type_idx
  ON kb_entities (entity_type);

COMMENT ON TABLE kb_entities IS
  'Alias dictionary for Chief of Staff query expansion. "fgs" -> "Family Gift Studio", etc.';

-- 3. Search feedback log — for future learning-to-rank
CREATE TABLE IF NOT EXISTS kb_search_feedback (
  id           bigserial PRIMARY KEY,
  query        text NOT NULL,
  source_id    text NOT NULL,
  source_type  text NOT NULL,
  rank_shown   int,
  action       text NOT NULL,  -- 'click' | 'dismiss' | 'helpful' | 'not_helpful'
  session_id   text,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kb_search_feedback_query_idx
  ON kb_search_feedback (lower(query));
CREATE INDEX IF NOT EXISTS kb_search_feedback_created_idx
  ON kb_search_feedback (created_at DESC);

COMMENT ON TABLE kb_search_feedback IS
  'Click + helpful/not-helpful signals for re-ranking. Aggregate over >500 sessions before using.';

-- 4. RPC for ranked FTS — single round trip from the app
CREATE OR REPLACE FUNCTION search_knowledge_items_fts(
  q text,
  brand_filter text DEFAULT NULL,
  limit_n int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  item_type text,
  content_plain text,
  tags text[],
  word_count int,
  brand text,
  summary text,
  rank real
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ki.id,
    ki.title,
    ki.item_type,
    ki.content_plain,
    ki.tags,
    ki.word_count,
    ki.brand,
    ki.summary,
    ts_rank_cd(ki.search_doc, websearch_to_tsquery('english', q)) AS rank
  FROM knowledge_items ki
  WHERE ki.search_doc @@ websearch_to_tsquery('english', q)
    AND (brand_filter IS NULL OR ki.brand = brand_filter)
    AND ki.word_count > 10
  ORDER BY rank DESC, ki.word_count DESC
  LIMIT limit_n
$$;

COMMENT ON FUNCTION search_knowledge_items_fts IS
  'Ranked FTS over knowledge_items. Uses weighted tsvector + websearch_to_tsquery for natural queries.';

-- 5. Grant anon read access (Chief of Staff API uses anon key as fallback)
GRANT SELECT ON kb_entities TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_items_fts TO anon, authenticated;
GRANT INSERT ON kb_search_feedback TO anon, authenticated;
GRANT USAGE ON SEQUENCE kb_search_feedback_id_seq TO anon, authenticated;
