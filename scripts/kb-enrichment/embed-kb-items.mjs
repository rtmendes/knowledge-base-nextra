#!/usr/bin/env node
/**
 * ⚠️ DEPRECATED (2026-07-02) — DO NOT RUN.
 * This script embeds with OpenAI text-embedding-3-small (1536 dims), but the live
 * knowledge_items.embedding column holds 384-dim vectors from the self-hosted embed
 * service (embed.insightprofit.live), and search_kb_by_embedding expects 384 dims.
 * Running this would write incomparable vectors and break semantic search.
 * Use instead: POST https://kb.insightprofit.live/api/kb/backfill  (free, matches prod)
 *
 * Generate vector embeddings for every knowledge_items row + store in pgvector.
 *
 * Prereqs (one-time):
 *   1. Apply 20260607_kb_enrichment.sql
 *   2. Apply the embedding column migration below (or run with --create-column flag)
 *   3. Have OPENAI_API_KEY in .env.local
 *
 * Usage:
 *   node scripts/kb-enrichment/embed-kb-items.mjs              # embed all items
 *   node scripts/kb-enrichment/embed-kb-items.mjs --backfill   # skip rows already embedded
 *   node scripts/kb-enrichment/embed-kb-items.mjs --limit 50   # cap for testing
 *
 * Cost: text-embedding-3-small is $0.02 per 1M input tokens.
 * Average KB item: ~500 tokens of (title + summary + first 2000 chars content).
 * 1000 items ≈ 500k tokens ≈ $0.01. Embedding the whole KB costs pennies.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
config({ path: join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY   = process.env.OPENAI_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}
if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY in .env.local')
  process.exit(1)
}

const args = new Set(process.argv.slice(2))
const BACKFILL_ONLY = args.has('--backfill')
const LIMIT = args.has('--limit')
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1], 10)
  : 10000
const BATCH_SIZE = 50

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

console.log(`Mode: ${BACKFILL_ONLY ? 'BACKFILL (skip embedded)' : 'ALL'}; limit=${LIMIT}; batch=${BATCH_SIZE}`)

// Ensure embedding column exists (no-op if already created)
const ENSURE_COL_SQL = `
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE knowledge_items ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS knowledge_items_embedding_idx
  ON knowledge_items USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
`
console.log('Ensuring embedding column + ivfflat index exist...')
console.log('  (If this fails, run the SQL manually in Supabase Studio:)')
console.log(ENSURE_COL_SQL.split('\n').map(l => '    ' + l).join('\n'))

// Fetch candidate items
const query = supabase
  .from('knowledge_items')
  .select('id, title, summary, content_plain, brand, tags')
  .gt('word_count', 10)
  .limit(LIMIT)

if (BACKFILL_ONLY) {
  query.is('embedding', null)
}

const { data: items, error } = await query
if (error) { console.error('Fetch failed:', error); process.exit(1) }
console.log(`Found ${items.length} item(s) to embed`)

// Embed in batches
let totalTokens = 0
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE)
  const inputs = batch.map(it => {
    // Compact representation — embed signal, not noise
    const head = `${it.title || ''}\nBrand: ${it.brand || 'n/a'}\nTags: ${(it.tags || []).join(', ')}`
    const body = it.summary || (it.content_plain || '').slice(0, 2000)
    return `${head}\n\n${body}`
  })

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: inputs,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Embedding batch ${i / BATCH_SIZE + 1} failed:`, err.slice(0, 500))
    process.exit(1)
  }

  const json = await res.json()
  totalTokens += json.usage?.total_tokens || 0

  // Update rows
  const updates = batch.map((it, idx) => ({
    id: it.id,
    embedding: json.data[idx].embedding,
  }))

  for (const u of updates) {
    const { error: upErr } = await supabase
      .from('knowledge_items')
      .update({ embedding: u.embedding })
      .eq('id', u.id)
    if (upErr) console.error(`Update ${u.id} failed:`, upErr.message)
  }

  console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(items.length / BATCH_SIZE)} done`)
}

const estCost = (totalTokens / 1_000_000) * 0.02
console.log(`\n✅ Embedded ${items.length} items, ${totalTokens.toLocaleString()} tokens, ~$${estCost.toFixed(4)}`)
console.log('Next: add a hybrid search RPC that combines tsvector rank + cosine similarity.')
