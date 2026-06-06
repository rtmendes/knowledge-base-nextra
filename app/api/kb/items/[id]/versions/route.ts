import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/kb/items/[id]/versions — list versions for an item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('knowledge_item_versions')
      .select('id, version_number, word_count, edited_by, created_at')
      .eq('item_id', id)
      .order('version_number', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[api/kb/versions] Error:', error)
      return NextResponse.json({ error: 'Failed to load versions' }, { status: 500 })
    }

    return NextResponse.json({ versions: data || [] })
  } catch (err: any) {
    console.error('[api/kb/versions] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
