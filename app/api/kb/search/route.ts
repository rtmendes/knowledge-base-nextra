import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.insightprofit.live'
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''
const EMBED_URL = process.env.EMBED_SERVICE_URL || 'https://embed.insightprofit.live'

// ── Types ────────────────────────────────────────────────────────────────────

interface RawItem {
  id: string
  title: string
  slug: string
  item_type: string
  category_id: string
  summary: string | null
  word_count: number
  content_plain?: string
}

interface SearchResult extends RawItem {
  similarity: number | null
  preview: string
  match_type: 'semantic' | 'keyword' | 'hybrid'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

/**
 * Keyword search using PostgREST full-text search (fts) which uses
 * PostgreSQL's built-in tsvector/tsquery engine — far more thorough than
 * ILIKE because it tokenises, stems, and ranks across the full column.
 * Falls back to ILIKE if FTS returns nothing (for partial-word queries).
 */
async function keywordSearch(
  query: string,
  categoryId: string | null,
  limit: number
): Promise<RawItem[]> {
  // Sanitise for tsquery: keep alphanumeric and spaces, split to words
  const tsWords = query
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' & ')  // AND between words in tsquery

  if (!tsWords) return []

  // FTS across title and content_plain using PostgREST's fts filter
  const ftsParams = new URLSearchParams({
    select: 'id,title,slug,item_type,category_id,summary,word_count,content_plain',
    status: 'eq.active',
    order: 'word_count.desc',
    limit: String(limit),
  })
  // PostgREST full-text: column=fts(config).query
  ftsParams.append('or', `(title.fts(english).${tsWords},content_plain.fts(english).${tsWords})`)
  if (categoryId) ftsParams.set('category_id', `eq.${categoryId}`)

  let ftsItems: RawItem[] = []
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?${ftsParams}`, {
      headers: HEADERS,
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) ftsItems = data
    }
  } catch { /* ignore — fall through to ILIKE */ }

  // If FTS returned nothing (e.g. partial word), fall back to ILIKE
  if (ftsItems.length === 0) {
    const ilikeParams = new URLSearchParams({
      select: 'id,title,slug,item_type,category_id,summary,word_count,content_plain',
      status: 'eq.active',
      order: 'word_count.desc',
      limit: String(limit),
    })
    ilikeParams.append(
      'or',
      `(title.ilike.*${encodeURIComponent(query.trim())}*,content_plain.ilike.*${encodeURIComponent(query.trim())}*)`
    )
    if (categoryId) ilikeParams.set('category_id', `eq.${categoryId}`)

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?${ilikeParams}`, {
        headers: HEADERS,
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) ftsItems = data
      }
    } catch { /* ignore */ }
  }

  return ftsItems
}

/**
 * Score a keyword result by how often the query terms appear in the item,
 * used to rank keyword-only results relative to semantic results.
 */
function keywordScore(item: RawItem, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const titleLower = (item.title || '').toLowerCase()
  const contentLower = (item.content_plain || '').toLowerCase()
  let score = 0
  for (const term of terms) {
    // Title matches are worth more
    const titleOccurrences = (titleLower.match(new RegExp(term, 'g')) || []).length
    // Count content occurrences (capped to avoid inflating very long docs)
    const contentOccurrences = Math.min(
      (contentLower.match(new RegExp(term, 'g')) || []).length,
      30
    )
    score += titleOccurrences * 5 + contentOccurrences
  }
  // Normalise to a 0–1 range similar to cosine similarity
  return Math.min(score / 50, 1)
}

/**
 * Extract a short preview snippet around the first keyword match in content.
 */
function extractPreview(item: RawItem, query: string): string {
  const content = item.content_plain || ''
  if (!content) return ''
  const term = query.split(/\s+/)[0]?.toLowerCase()
  if (!term) return content.slice(0, 200)
  const idx = content.toLowerCase().indexOf(term)
  if (idx === -1) return content.slice(0, 200)
  const start = Math.max(0, idx - 80)
  const end = Math.min(content.length, idx + 200)
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { query, category_id, limit = 10, threshold = 0.25 } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string required' }, { status: 400 })
    }

    const categoryId: string | null = category_id || null

    // ── Run semantic and keyword searches in parallel ─────────────────────────
    const [embedRes, keywordItems] = await Promise.allSettled([
      fetch(`${EMBED_URL}/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [query] }),
      }),
      keywordSearch(query, categoryId, limit * 2),
    ])

    // Map: id → result for deduplication
    const resultMap = new Map<string, SearchResult>()

    // ── 1. Semantic results ───────────────────────────────────────────────────
    let semanticOk = false
    if (embedRes.status === 'fulfilled' && embedRes.value.ok) {
      try {
        const { embeddings } = await embedRes.value.json()
        const queryEmbedding = embeddings[0]

        const searchRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_kb_by_embedding`, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({
            query_embedding: JSON.stringify(queryEmbedding),
            match_count: limit * 2,
            match_threshold: threshold,
            filter_category_id: categoryId,
          }),
        })

        if (searchRes.ok) {
          const semanticData: any[] = await searchRes.json()
          semanticOk = true
          for (const r of semanticData) {
            resultMap.set(r.id, {
              id: r.id,
              title: r.title,
              slug: r.slug,
              item_type: r.item_type,
              category_id: r.category_id,
              summary: r.summary,
              word_count: r.word_count,
              similarity: r.similarity,
              preview: (r.content || r.content_plain || '').substring(0, 300),
              match_type: 'semantic',
            })
          }
        }
      } catch { /* fall through to keyword only */ }
    }

    // ── 2. Keyword results — always merge, not just fallback ─────────────────
    const kwItems = keywordItems.status === 'fulfilled' ? keywordItems.value : []
    for (const item of kwItems) {
      const existing = resultMap.get(item.id)
      const kwScore = keywordScore(item, query)
      if (existing) {
        // Item appeared in both — upgrade to hybrid, boost its similarity
        const boostedSimilarity = Math.min(1, (existing.similarity ?? 0) + kwScore * 0.3)
        resultMap.set(item.id, {
          ...existing,
          similarity: boostedSimilarity,
          match_type: 'hybrid',
          // Use keyword snippet as preview (more relevant to what user searched)
          preview: extractPreview(item, query) || existing.preview,
        })
      } else {
        // Keyword-only hit — still include it with a synthetic similarity score
        resultMap.set(item.id, {
          id: item.id,
          title: item.title,
          slug: item.slug,
          item_type: item.item_type,
          category_id: item.category_id,
          summary: item.summary,
          word_count: item.word_count,
          similarity: kwScore,
          preview: extractPreview(item, query),
          match_type: 'keyword',
        })
      }
    }

    // ── 3. Sort and trim ──────────────────────────────────────────────────────
    // Hybrid > semantic > keyword; within each tier, sort by similarity desc
    const tierOrder: Record<string, number> = { hybrid: 0, semantic: 1, keyword: 2 }
    const results = Array.from(resultMap.values())
      .sort((a, b) => {
        const tierDiff = tierOrder[a.match_type] - tierOrder[b.match_type]
        if (tierDiff !== 0) return tierDiff
        return (b.similarity ?? 0) - (a.similarity ?? 0)
      })
      .slice(0, limit)
      // Strip content_plain from response to keep payload small
      .map(({ ...r }) => {
        delete (r as any).content_plain
        return r
      })

    const searchType = results.some(r => r.match_type === 'hybrid')
      ? 'hybrid'
      : results.some(r => r.match_type === 'semantic')
      ? (semanticOk ? 'semantic' : 'text_fallback')
      : 'keyword'

    return NextResponse.json({ results, search_type: searchType, query })
  } catch (error) {
    console.error('[kb-search] Unhandled error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
