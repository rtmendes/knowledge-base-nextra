# Changelog

All notable changes to knowledge-base-nextra (kb.insightprofit.live).

## [Unreleased] — 2026-07-02 (feat/kb-canonical-reader)

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
