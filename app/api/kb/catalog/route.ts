import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/kb/catalog — machine-readable doc index for agents.
 *
 * Query params:
 *   type   — comma-separated item_type filter (e.g. ?type=sop,department_sop)
 *   q      — title substring filter (case-insensitive)
 *   limit  — page size (default 100, max 500)
 *   offset — pagination offset (default 0)
 *
 * Returns lightweight rows (no content) so catalog.json / Command Center can
 * point agents at the right doc, then fetch it via GET /api/kb/read/[slug].
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get('type')
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0)

    let query = supabaseAdmin
      .from('knowledge_items')
      .select('id, title, slug, item_type, category_id, summary, word_count, tags, updated_at', {
        count: 'exact',
      })
      .eq('status', 'active')
      .order('title', { ascending: true })
      .range(offset, offset + limit - 1)

    if (typeParam) {
      const types = typeParam.split(',').map(t => t.trim()).filter(Boolean)
      if (types.length > 0) query = query.in('item_type', types)
    }
    if (q) query = query.ilike('title', `%${q}%`)

    const { data, error, count } = await query

    if (error) {
      console.error('[api/kb/catalog] Supabase error:', error)
      return NextResponse.json({ error: 'Catalog query failed', details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      docs: (data || []).map(d => ({
        ...d,
        // Some rows (e.g. department_sop) have null slugs — fall back to id,
        // which /api/kb/read/[slug] also accepts.
        read_url: `/api/kb/read/${d.slug || d.id}`,
      })),
      total: count ?? 0,
      limit,
      offset,
    })
  } catch (err: any) {
    console.error('[api/kb/catalog] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
