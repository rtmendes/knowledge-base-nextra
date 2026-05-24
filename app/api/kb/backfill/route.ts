/**
 * POST /api/kb/backfill
 * Generates embeddings for knowledge_items that are missing them.
 *
 * Also detects and flags "bot-blocked" items whose content_plain
 * contains Cloudflare security-challenge text instead of real content.
 *
 * Body (all optional):
 *   { batchSize?: number, itemType?: string, dryRun?: boolean }
 *
 * Auth: Bearer $AGENT_API_KEY (or unrestricted if key not set)
 *
 * This is safe to call repeatedly — it skips items that already have
 * an embedding and only processes ones where embedding IS NULL.
 */

import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.insightprofit.live'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const EMBED_URL = process.env.EMBED_SERVICE_URL || 'https://embed.insightprofit.live'

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

// Phrases that appear in Cloudflare bot-challenge pages
const BOT_BLOCK_SIGNALS = [
  'security verification',
  'verifying you are not a bot',
  'cloudflare ray id',
  'please wait while we verify',
]

function isBotBlocked(contentPlain: string): boolean {
  const lower = (contentPlain || '').toLowerCase()
  return BOT_BLOCK_SIGNALS.some(sig => lower.includes(sig))
}

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return true
  return req.headers.get('authorization') === `Bearer ${key}`
}

export const maxDuration = 60 // allow up to 60s for larger batches

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const batchSize: number = Math.min(body.batchSize ?? 50, 200)
  const itemType: string | null = body.itemType || null
  const dryRun: boolean = body.dryRun === true

  // ── Fetch items without embeddings ─────────────────────────────────────────
  const params = new URLSearchParams({
    select: 'id,title,content_plain,word_count,item_type',
    embedding: 'is.null',
    status: 'eq.active',
    order: 'word_count.desc',
    limit: String(batchSize),
  })
  if (itemType) params.set('item_type', `eq.${itemType}`)

  const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })

  if (!fetchRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 502 })
  }

  const items: any[] = await fetchRes.json()

  if (items.length === 0) {
    return NextResponse.json({ message: 'No items need embeddings', processed: 0 })
  }

  if (dryRun) {
    const botBlocked = items.filter(i => isBotBlocked(i.content_plain || ''))
    return NextResponse.json({
      dryRun: true,
      wouldProcess: items.length,
      botBlockedCount: botBlocked.length,
      botBlockedTitles: botBlocked.map(i => i.title).slice(0, 10),
      sample: items.slice(0, 5).map(i => ({ id: i.id, title: i.title, item_type: i.item_type, word_count: i.word_count })),
    })
  }

  // ── Generate embeddings in sub-batches of 20 ───────────────────────────────
  const EMBED_BATCH = 20
  let embedded = 0
  let flaggedBotBlocked = 0
  const errors: string[] = []

  for (let i = 0; i < items.length; i += EMBED_BATCH) {
    const chunk = items.slice(i, i + EMBED_BATCH)

    // Separate bot-blocked from real content
    const realItems = chunk.filter(item => !isBotBlocked(item.content_plain || ''))
    const botItems = chunk.filter(item => isBotBlocked(item.content_plain || ''))

    // Flag bot-blocked items so they can be re-ingested
    for (const item of botItems) {
      await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?id=eq.${item.id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({
          status: 'draft',
          metadata: { bot_blocked: true, flagged_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        }),
      })
      flaggedBotBlocked++
    }

    if (realItems.length === 0) continue

    // Build text to embed: title + content_plain (capped to avoid huge payloads)
    const texts = realItems.map(item => {
      const title = (item.title || '').trim()
      const content = (item.content_plain || '').slice(0, 8000)
      return `${title}\n\n${content}`.trim()
    })

    try {
      const embedRes = await fetch(`${EMBED_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts }),
      })

      if (!embedRes.ok) {
        errors.push(`Embed service error for batch ${i}: ${embedRes.status}`)
        continue
      }

      const { embeddings } = await embedRes.json()

      // Write embeddings back to Supabase one by one (batch PATCH not supported)
      await Promise.allSettled(
        realItems.map((item, idx) =>
          fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: HEADERS,
            body: JSON.stringify({
              embedding: JSON.stringify(embeddings[idx]),
              updated_at: new Date().toISOString(),
            }),
          })
        )
      )

      embedded += realItems.length
    } catch (err: any) {
      errors.push(`Batch ${i} error: ${err.message}`)
    }
  }

  return NextResponse.json({
    processed: items.length,
    embedded,
    flaggedBotBlocked,
    errors: errors.length ? errors : undefined,
    message: `Embedded ${embedded} items, flagged ${flaggedBotBlocked} bot-blocked items for re-ingestion`,
  })
}

// GET: quick status — how many items need embeddings
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = new URLSearchParams({
    select: 'item_type',
    embedding: 'is.null',
    status: 'eq.active',
    limit: '5000',
  })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to query' }, { status: 502 })
  }

  const items: any[] = await res.json()
  const typeCounts: Record<string, number> = {}
  for (const item of items) {
    typeCounts[item.item_type] = (typeCounts[item.item_type] || 0) + 1
  }

  return NextResponse.json({
    totalMissingEmbeddings: items.length,
    byType: typeCounts,
  })
}
