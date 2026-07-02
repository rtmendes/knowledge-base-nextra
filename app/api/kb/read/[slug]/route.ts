import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/kb/read/[slug] — full document by slug (or id, if a UUID is passed).
 *
 * Query params:
 *   plain=1 — return content_plain instead of markdown content
 *
 * Companion to GET /api/kb/catalog: agents list docs there, read them here.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const plain = searchParams.get('plain') === '1'

    const select = plain
      ? 'id, title, slug, item_type, category_id, summary, word_count, tags, metadata, updated_at, content_plain'
      : 'id, title, slug, item_type, category_id, summary, word_count, tags, metadata, updated_at, content'

    const column = UUID_RE.test(slug) ? 'id' : 'slug'

    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .select(select)
      .eq(column, slug)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[api/kb/read] Supabase error:', error)
      return NextResponse.json({ error: 'Read query failed', details: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: `No active item with ${column} "${slug}"` }, { status: 404 })
    }

    return NextResponse.json({ doc: data })
  } catch (err: any) {
    console.error('[api/kb/read] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
