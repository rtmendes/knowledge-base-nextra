import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/kb/items/[id]/update-meta
 * Updates the title and/or tags of a knowledge item.
 * Accepts a partial body — only fields present are updated.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, tags } = body

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return NextResponse.json({ error: 'Title must be a non-empty string' }, { status: 400 })
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) patch.title = title.trim()
    if (tags !== undefined) patch.tags = Array.isArray(tags) ? tags.map(String) : []

    const { error } = await supabaseAdmin
      .from('knowledge_items')
      .update(patch)
      .eq('id', id)

    if (error) {
      console.error('[api/kb/items/update-meta]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...patch })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
