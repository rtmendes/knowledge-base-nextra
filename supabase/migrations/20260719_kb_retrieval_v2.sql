-- ─────────────────────────────────────────────────────────────────────────
-- KB Retrieval v2 — hybrid ranked search + zero-touch categorization
-- ─────────────────────────────────────────────────────────────────────────
-- Purpose:
--   1. kb_hybrid_search(): single-round-trip ranked search fusing the
--      existing weighted search_doc tsvector (ts_rank_cd) with the existing
--      384-dim embeddings (cosine) via Reciprocal Rank Fusion. Replaces the
--      route-side merge that ordered keyword hits by word_count.
--   2. kb_suggest_category(): nearest-category suggestion from live
--      per-category embedding centroids — powers auto-categorization on
--      ingest so no manual filing is required.
--   3. content_hash column on knowledge_items — URL/content dedupe for the
--      ingest endpoint.
--
-- ADDITIVE ONLY. No DROP / DELETE / UPDATE of existing data. Idempotent —
-- safe to run multiple times. Requires: pgvector (already installed —
-- knowledge_items.embedding vector(384) exists and is populated),
-- search_doc tsvector (from 20260607_kb_enrichment.sql).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Dedupe hash (additive)
ALTER TABLE knowledge_items
  ADD COLUMN IF NOT EXISTS content_hash text;

CREATE INDEX IF NOT EXISTS knowledge_items_content_hash_idx
  ON knowledge_items (content_hash) WHERE content_hash IS NOT NULL;

COMMENT ON COLUMN knowledge_items.content_hash IS
  'sha256 of normalized source URL (or content) — ingest dedupe key. Nullable; legacy rows unhashed.';

-- 2. Hybrid ranked search (RRF over FTS + vector)
CREATE OR REPLACE FUNCTION kb_hybrid_search(
  query_text          text,
  query_embedding     vector(384) DEFAULT NULL,
  match_count         int  DEFAULT 20,
  filter_category_id  uuid DEFAULT NULL,
  rrf_k               int  DEFAULT 50
)
RETURNS TABLE (
  id          uuid,
  title       text,
  slug        text,
  item_type   text,
  category_id uuid,
  summary     text,
  word_count  int,
  similarity  float,
  preview     text,
  match_type  text
)
LANGUAGE sql STABLE AS $$
WITH ft AS (
  SELECT ki.id,
         row_number() OVER (ORDER BY ts_rank_cd(ki.search_doc, q) DESC) AS r
  FROM knowledge_items ki,
       websearch_to_tsquery('english', query_text) q
  WHERE ki.status = 'active'
    AND ki.search_doc @@ q
    AND (filter_category_id IS NULL OR ki.category_id = filter_category_id)
  ORDER BY ts_rank_cd(ki.search_doc, q) DESC
  LIMIT 60
),
vec AS (
  SELECT ki.id,
         row_number() OVER (ORDER BY ki.embedding <=> query_embedding) AS r
  FROM knowledge_items ki
  WHERE query_embedding IS NOT NULL
    AND ki.status = 'active'
    AND ki.embedding IS NOT NULL
    AND (filter_category_id IS NULL OR ki.category_id = filter_category_id)
  ORDER BY ki.embedding <=> query_embedding
  LIMIT 60
)
SELECT ki.id,
       ki.title,
       ki.slug,
       ki.item_type,
       ki.category_id,
       ki.summary,
       ki.word_count::int,
       (coalesce(1.0/(rrf_k + ft.r), 0) + coalesce(1.0/(rrf_k + vec.r), 0))::float AS similarity,
       ts_headline(
         'english',
         left(coalesce(ki.content_plain, ki.summary, ''), 4000),
         websearch_to_tsquery('english', query_text),
         'MaxFragments=2, MaxWords=18, MinWords=6, FragmentDelimiter=" … "'
       ) AS preview,
       CASE
         WHEN ft.id IS NOT NULL AND vec.id IS NOT NULL THEN 'hybrid'
         WHEN vec.id IS NOT NULL THEN 'semantic'
         ELSE 'keyword'
       END AS match_type
FROM knowledge_items ki
JOIN (SELECT id FROM ft UNION SELECT id FROM vec) matched ON matched.id = ki.id
LEFT JOIN ft  ON ft.id  = ki.id
LEFT JOIN vec ON vec.id = ki.id
ORDER BY similarity DESC
LIMIT match_count;
$$;

COMMENT ON FUNCTION kb_hybrid_search IS
  'Ranked KB search: RRF fusion of weighted FTS (search_doc, ts_rank_cd) and 384-dim cosine similarity. query_embedding NULL → keyword-only. Returns ts_headline snippets.';

-- 3. Auto-categorization: nearest category by live embedding centroid
CREATE OR REPLACE FUNCTION kb_suggest_category(
  query_embedding vector(384),
  top_n           int DEFAULT 3
)
RETURNS TABLE (
  category_id uuid,
  name        text,
  slug        text,
  similarity  float
)
LANGUAGE sql STABLE AS $$
SELECT c.id,
       c.name,
       c.slug,
       (1 - (cent.centroid <=> query_embedding))::float AS similarity
FROM kb_categories c
JOIN LATERAL (
  SELECT avg(ki.embedding) AS centroid
  FROM knowledge_items ki
  WHERE ki.category_id = c.id
    AND ki.embedding IS NOT NULL
    AND ki.status = 'active'
) cent ON cent.centroid IS NOT NULL
ORDER BY cent.centroid <=> query_embedding
LIMIT top_n;
$$;

COMMENT ON FUNCTION kb_suggest_category IS
  'Nearest KB categories for an embedding, via on-the-fly per-category centroids. Powers zero-touch filing on /api/kb/ingest.';

-- 4. Grants — match existing RPC accessibility (search_kb_by_embedding is anon-callable)
GRANT EXECUTE ON FUNCTION kb_hybrid_search(text, vector, int, uuid, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION kb_suggest_category(vector, int) TO anon, authenticated, service_role;
