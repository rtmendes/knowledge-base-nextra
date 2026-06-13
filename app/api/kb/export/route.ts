import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = Array.isArray(val) ? val.join('; ') : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const sp = request.nextUrl.searchParams
    const categoryId = sp.get('category_id') || ''
    const itemType = sp.get('item_type') || ''
    const q = sp.get('q') || ''

    let query = supabaseAdmin
      .from('knowledge_items')
      .select(`
        id, title, item_type, category_id, tags, word_count, status, created_at, metadata,
        kb_categories!inner(name)
      `)
      .order('created_at', { ascending: false })
      .limit(10000)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (itemType) query = query.eq('item_type', itemType)
    if (q) query = query.ilike('title', `%${q}%`)

    const { data, error } = await query

    if (error) {
      console.error('[api/kb/export] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const headers = ['id', 'title', 'item_type', 'category', 'tags', 'word_count', 'status', 'created_at', 'source_url']
    const rows = (data || []).map(item => [
      item.id,
      item.title,
      item.item_type,
      (item as any).kb_categories?.name || '',
      item.tags,
      item.word_count,
      item.status,
      item.created_at,
      (item.metadata as any)?.source_url || '',
    ].map(escapeCsv).join(','))

    const csv = [headers.join(','), ...rows].join('\n')
    const filename = `kb-export-${new Date().toISOString().slice(0, 10)}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('[api/kb/export] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
