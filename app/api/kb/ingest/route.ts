import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

const EMBED_URL = process.env.EMBED_SERVICE_URL || 'https://embed.insightprofit.live'
const FALLBACK_CATEGORY_SLUG = 'uploads-imports'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200)
}

/** Normalize a URL for dedupe hashing: lowercase host, strip tracking params, trailing slash. */
function normalizeUrl(u: URL): string {
  const drop = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref']
  drop.forEach(p => u.searchParams.delete(p))
  const qs = u.searchParams.toString()
  return `${u.protocol}//${u.host.toLowerCase()}${u.pathname.replace(/\/+$/, '')}${qs ? '?' + qs : ''}`
}

/** Embed text via the internal embed service. Non-fatal — returns null on any failure. */
async function embedText(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${EMBED_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] }),
    })
    if (!res.ok) return null
    const { embeddings } = await res.json()
    return Array.isArray(embeddings?.[0]) ? embeddings[0] : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { url, category_id, tags } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // ── Dedupe: never insert the same source twice, never overwrite ──────────
    const contentHash = createHash('sha256').update(normalizeUrl(parsedUrl)).digest('hex')
    try {
      const { data: dupe } = await supabaseAdmin
        .from('knowledge_items')
        .select('id, title, slug')
        .eq('content_hash', contentHash)
        .limit(1)
        .maybeSingle()
      if (dupe) {
        return NextResponse.json({
          id: dupe.id,
          title: dupe.title,
          slug: dupe.slug,
          created: false,
          status: 'duplicate',
        })
      }
    } catch { /* content_hash column not migrated yet — proceed without dedupe */ }

    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'FIRECRAWL_API_KEY not configured' }, { status: 500 })
    }

    // Scrape via Firecrawl
    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!scrapeRes.ok) {
      const errText = await scrapeRes.text()
      console.error('[api/kb/ingest] Firecrawl error:', scrapeRes.status, errText)
      return NextResponse.json(
        { error: `Firecrawl scrape failed (${scrapeRes.status})` },
        { status: 502 }
      )
    }

    const scrapeData = await scrapeRes.json()

    if (!scrapeData.success) {
      return NextResponse.json({ error: 'Firecrawl returned unsuccessful response' }, { status: 502 })
    }

    const markdown = scrapeData.data?.markdown || ''
    const pageTitle = scrapeData.data?.metadata?.title || parsedUrl.hostname

    const slug = slugify(pageTitle)
    const contentPlain = markdown.replace(/[#*_`[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = contentPlain ? contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length : 0
    const now = new Date().toISOString()

    // ── Enrich on write: embedding + summary (non-fatal) ─────────────────────
    const embedding = await embedText(`${pageTitle}\n\n${contentPlain.slice(0, 2000)}`)
    const summary = contentPlain.slice(0, 200) || null

    // ── Zero-touch categorization when no category supplied ──────────────────
    let resolvedCategoryId: string | null = category_id || null
    let autoCategorized = false
    let autoConfidence: number | null = null

    if (!resolvedCategoryId && embedding) {
      try {
        const { data: suggestions } = await supabaseAdmin.rpc('kb_suggest_category', {
          query_embedding: JSON.stringify(embedding),
          top_n: 1,
        })
        const top = Array.isArray(suggestions) ? suggestions[0] : null
        if (top?.category_id) {
          resolvedCategoryId = top.category_id
          autoCategorized = true
          autoConfidence = typeof top.similarity === 'number' ? top.similarity : null
        }
      } catch { /* RPC not migrated yet — fall through */ }
    }

    if (!resolvedCategoryId) {
      // Last-resort default bucket so ingest never requires manual filing
      const { data: fallbackCat } = await supabaseAdmin
        .from('kb_categories')
        .select('id')
        .eq('slug', FALLBACK_CATEGORY_SLUG)
        .limit(1)
        .maybeSingle()
      resolvedCategoryId = fallbackCat?.id || null
    }

    if (!resolvedCategoryId) {
      return NextResponse.json({ error: 'Category is required (no auto-categorization target available)' }, { status: 400 })
    }

    const insertPayload: Record<string, any> = {
      title: pageTitle.trim(),
      slug,
      item_type: 'imported',
      category_id: resolvedCategoryId,
      content: markdown,
      content_plain: contentPlain,
      word_count: wordCount,
      status: 'active',
      tags: tags || [],
      summary,
      metadata: {
        source_url: url,
        scraped_at: now,
        auto_categorized: autoCategorized,
        ...(autoConfidence !== null ? { auto_confidence: autoConfidence } : {}),
      },
      created_at: now,
      updated_at: now,
    }
    if (embedding) insertPayload.embedding = JSON.stringify(embedding)
    insertPayload.content_hash = contentHash

    let { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert(insertPayload)
      .select('id, title, slug')
      .single()

    // Retry without v2 columns if the migration hasn't been applied yet
    if (error && /content_hash|embedding|summary/.test(error.message || '')) {
      delete insertPayload.content_hash
      delete insertPayload.embedding
      delete insertPayload.summary
      ;({ data, error } = await supabaseAdmin
        .from('knowledge_items')
        .insert(insertPayload)
        .select('id, title, slug')
        .single())
    }

    if (error || !data) {
      console.error('[api/kb/ingest] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save item', details: error?.message }, { status: 500 })
    }

    // Update category item count (non-fatal if RPC missing)
    try {
      await supabaseAdmin.rpc('increment_category_count', { cat_id: resolvedCategoryId })
    } catch { /* non-critical */ }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      slug: data.slug,
      created: true,
      category_id: resolvedCategoryId,
      auto_categorized: autoCategorized,
      ...(autoConfidence !== null ? { auto_confidence: autoConfidence } : {}),
    })
  } catch (err: any) {
    console.error('[api/kb/ingest] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
