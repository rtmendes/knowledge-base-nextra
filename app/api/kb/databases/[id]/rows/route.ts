import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/kb/databases/[id]/rows — add a row
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: databaseId } = await params
    const body = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Get next sort order
    const { data: lastRow } = await supabaseAdmin
      .from('kb_database_rows')
      .select('sort_order')
      .eq('database_id', databaseId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSort = (lastRow?.sort_order ?? -1) + 1

    // If this row should also create a linked KB item (opens as page)
    let linkedItemId = body.linked_item_id || null
    if (body.create_linked_item && body.values) {
      // Find the title column value
      const titleValue = Object.values(body.values).find(
        (v: any) => typeof v === 'string' && v.length > 0
      ) as string || 'Untitled'

      // Create a KB item for this row
      const slug = titleValue.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 200)
      const { data: newItem, error: itemError } = await supabaseAdmin
        .from('knowledge_items')
        .insert({
          user_id: '893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0',
          title: titleValue,
          slug,
          item_type: 'database_page',
          content: '',
          content_plain: '',
          status: 'active',
          tags: [],
          metadata: { source_database_id: databaseId },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (!itemError && newItem) {
        linkedItemId = newItem.id
      }
    }

    const { data, error } = await supabaseAdmin
      .from('kb_database_rows')
      .insert({
        database_id: databaseId,
        linked_item_id: linkedItemId,
        values: body.values || {},
        sort_order: body.sort_order ?? nextSort,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/kb/databases/[id]/rows — bulk reorder rows
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: databaseId } = await params
    const body = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // body.order = [{ id: 'row-uuid', sort_order: 0 }, ...]
    if (!body.order || !Array.isArray(body.order)) {
      return NextResponse.json({ error: 'order array required' }, { status: 400 })
    }

    for (const item of body.order) {
      await supabaseAdmin
        .from('kb_database_rows')
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq('id', item.id)
        .eq('database_id', databaseId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
