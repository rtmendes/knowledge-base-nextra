# Changelog

All notable changes to knowledge-base-nextra (kb.insightprofit.live).

## [Unreleased] — 2026-07-02 (chore/kb-embedding-backfill)

### Changed
- **Embedding backfill completed** — 48 active items missing embeddings (9 SOPs incl.
  Agent Intercom Protocol AIP-001, 5 PRDs, 23 external references, 3 ingest-test items)
  embedded via the existing `POST /api/kb/backfill` endpoint using the self-hosted
  embed service (embed.insightprofit.live, 384-dim vectors, $0 cost). 0 active items
  remain unembedded; all now findable via `/api/kb/search` semantic search.
  Verified: "agent intercom protocol" returns the actual AIP-001 SOP as top hit.
- **Deprecation warning added to `scripts/kb-enrichment/embed-kb-items.mjs`** — the
  OpenAI-based script writes 1536-dim vectors, incompatible with the KB's 384-dim
  embedding column and `search_kb_by_embedding` RPC. Use `POST /api/kb/backfill` instead.

## [Merged] — 2026-07-02 (feat/kb-canonical-reader, PR #25)

### Added
- **Canonical KB reader for agents** — `GET /api/kb/catalog` (machine-readable doc
  index: id/title/slug/item_type/summary/word_count/tags + ready-made `read_url`;
  filters: `?type=sop,department_sop`, `?q=`, `limit`/`offset`) and
  `GET /api/kb/read/[slug]` (full document by slug or UUID; `?plain=1` for plain text).
  Verified: 120 SOPs indexed and readable end-to-end (`scripts/tests/kb-reader-verify.mjs`).
- **Object storage wiring (Cloudflare R2)** — `lib/r2.ts` config module reusing the
  EXISTING `elite-writer-media` bucket under the `kb/` prefix (no new paid bucket).
  Env-var references only (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET`, `R2_KB_PREFIX`) — see `docs/STORAGE.md` for token setup.
  `/api/health` now reports `hasR2Config`.
- **Genspark/Manus folder ingestion** — `scripts/kb-ingest/ingest.mjs`: scans an export
  folder (md/html/json/txt), dry-run by default, `--apply` inserts editable copies with
  the original file preserved verbatim in `metadata.original_snapshot`. Dedupes by slug;
  insert-only (never updates/deletes). Test batch of 3 files ingested and verified
  readable via the reader (tag `ingest-test`, category Uploads & Imports).
- **Reader verification script** — `scripts/tests/kb-reader-verify.mjs`: proves SOPs
  are agent-queryable (catalog → read → search), prints SOP readability report.

### Known issues
- `knowledge_items` FTS has no GIN index — PostgREST full-text queries hit the
  statement timeout, so `/api/kb/search` keyword leg silently degrades to
  semantic-only and unembedded (freshly ingested) items are unfindable via search
  until the embedding backfill runs. Tracked for a separate migration.
