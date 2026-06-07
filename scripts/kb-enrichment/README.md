# KB Enrichment Runbook

Scripts that upgrade the Chief of Staff search stack from "ILIKE everything" to
"entity-aware FTS + optional vector hybrid."

All scripts read env from `.env.local` at repo root. Required:

```
NEXT_PUBLIC_SUPABASE_URL=https://supabase.insightprofit.live
SUPABASE_SERVICE_ROLE_KEY=...   # NOT the anon key
OPENAI_API_KEY=...              # only for embed-kb-items.mjs
GITHUB_TOKEN=...                # optional, raises GitHub rate limit
SUPABASE_DB_URL=postgres://...  # optional fallback for run-migration.mjs
```

> ⚠️ Never commit `.env.local`. Service role key is privileged.

---

## Order of operations

### 1. Apply the schema (one-time)

```bash
node scripts/kb-enrichment/run-migration.mjs
```

Applies, in order:
- `20260607_kb_enrichment.sql` — adds `brand`, `summary`, `search_doc` tsvector
  + GIN index on `knowledge_items`. Creates `kb_entities` + `kb_search_feedback`.
  Defines RPC `search_knowledge_items_fts(q, brand_filter, limit_n)`.
- `20260607_seed_kb_entities.sql` — populates 32 canonical entities (28 apps +
  2 brands + 4 services) with aliases.

If the script can't reach pg-meta, paste each file into Supabase Studio →
SQL Editor manually. Migrations are idempotent (`IF NOT EXISTS` / `ON CONFLICT`).

**Verify:**
```sql
select count(*) from kb_entities;       -- expect ≥ 32
select canonical, aliases from kb_entities where canonical ilike 'family%';
\df search_knowledge_items_fts          -- function exists
```

### 2. Ingest external repos (Octopoda-OS, memkraft, …)

```bash
node scripts/kb-enrichment/ingest-github-repo.mjs RyjoxTechnologies/Octopoda-OS --brand research
node scripts/kb-enrichment/ingest-github-repo.mjs seojoonkim/memkraft --brand research
```

Each repo's `README.md`, `docs/`, `adr/`, `rfcs/`, `spec/` `.md`/`.mdx` files
become `knowledge_items` rows (`item_type='external-reference'`). Source URL is
stored inside `tags` as `src:<github-url>` — no schema change needed.

Re-running upserts by title, so safe to run repeatedly.

### 3. (Optional) Vector index everything

Only if you want Tier 2 hybrid search. Tier 1 (entity dict + tsvector FTS) is
already a massive upgrade without this step.

```bash
node scripts/kb-enrichment/embed-kb-items.mjs --backfill
```

Cost reference: `text-embedding-3-small` at $0.02 per 1M tokens.
~1k KB items ≈ 500k tokens ≈ **$0.01 total**.

After embeddings exist, a future migration will add a `search_knowledge_items_hybrid`
RPC that blends `ts_rank_cd` with `1 - (embedding <=> query_embedding)`.

---

## How the route uses all of this

`app/api/kb/chat/route.ts`:

1. Extracts terms + phrases from the user question.
2. Calls `expandEntities(terms, phrases)` → queries `kb_entities` by
   `.overlaps('aliases', terms)` + ILIKE on canonical. Adds canonical names to
   the search query (e.g. "fgs" → "Family Gift Studio").
3. Calls `search_knowledge_items_fts` RPC (fast path). Falls back to
   ILIKE phrase pass → ILIKE term pass if RPC unavailable (pre-migration).
4. Threads enriched terms through all 7 federated searches (knowledge_items,
   app_catalog, ai_agents, tech_tools, offer_pipeline, clickup_tasks,
   credential_registry).
5. Coverage scoring: groupsHit-first then per-result score.
6. System prompt receives `matchedEntities` so the LLM grounds answers in
   real apps/brands, never DEAD repos.

Result: the agent can answer "where are FGS design docs?" even though no row
contains the literal string "FGS" — the alias "fgs" → "Family Gift Studio"
expansion happens server-side before any search.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "function search_knowledge_items_fts does not exist" | Migration not applied | Run `run-migration.mjs` or paste SQL into Studio. Route auto-falls-back to ILIKE meanwhile. |
| Entity expansion silently does nothing | `kb_entities` table missing | Apply migration. Route silently swallows the error so prod stays up. |
| ingest-github-repo.mjs: rate limited | Anonymous GH API limit | Set `GITHUB_TOKEN` in `.env.local` (raises to 5000/hr). |
| embed-kb-items.mjs: vector column missing | pgvector ext or column not created | Script prints the SQL — paste into Studio once. |

---

## Future tiers (not yet implemented)

- **Tier 3 LTR:** `kb_search_feedback` table is already created by the
  migration. Log clicks + thumbs-up/down from the widget, train a lightweight
  reranker (Postgres function or external service), call it after FTS.
- **Per-user pinning:** add `kb_user_preferences` (which apps a user cares about
  most) and boost matching brand in `search_knowledge_items_fts`.
- **Daily sync of GitHub repos:** wrap `ingest-github-repo.mjs` in a Vercel cron
  to keep external refs current.
