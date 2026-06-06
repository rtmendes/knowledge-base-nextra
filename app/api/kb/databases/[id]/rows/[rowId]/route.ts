import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// PUT /api/kb/databases/[id]/rows/[rowId] — update a row's values
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { id: databaseId, rowId } = await params
    const body = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    if (body.values !== undefined) updates.values = body.values
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order
    if (body.linked_item_id !== undefined) updates.linked_item_id = body.linked_item_id

    const { data, error } = await supabaseAdmin
      .from('kb_database_rows')
      .update(updates)
      .eq('id', rowId)
      .eq('database_id', databaseId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If this row has a linked item, update its title to match the title column
    if (data?.linked_item_id && body.values) {
      // Get the database to find the title column
      const { data: db } = await supabaseAdmin
        .from('kb_databases')
        .select('columns')
        .eq('id', databaseId)
        .single()

      if (db?.columns) {
        const titleCol = (db.columns as any[]).find((c: any) => c.type === 'title')
        if (titleCol && body.values[titleCol.id]) {
          await supabaseAdmin
            .from('knowledge_items')
            .update({
              title: body.values[titleCol.id],
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.linked_item_id)
        }
      }
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/kb/databases/[id]/rows/[rowId] — delete a row
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rowId: string }> }
) {
  try {
    const { id: databaseId, rowId } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { error } = await supabaseAdmin
      .from('kb_database_rows')
      .delete()
      .eq('id', rowId)
      .eq('database_id', databaseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
