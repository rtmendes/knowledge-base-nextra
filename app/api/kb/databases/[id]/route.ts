import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/kb/databases/[id] — get database schema + all rows
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Fetch database definition
    const { data: db, error: dbError } = await supabaseAdmin
      .from('kb_databases')
      .select('*')
      .eq('id', id)
      .single()

    if (dbError || !db) {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }

    // Fetch all rows
    const { data: rows, error: rowsError } = await supabaseAdmin
      .from('kb_database_rows')
      .select('*')
      .eq('database_id', id)
      .order('sort_order', { ascending: true })

    if (rowsError) {
      return NextResponse.json({ error: rowsError.message }, { status: 500 })
    }

    // Fetch relations for this database's rows
    const rowIds = (rows || []).map((r: any) => r.id)
    let relations: any[] = []
    if (rowIds.length > 0) {
      const { data: rels } = await supabaseAdmin
        .from('kb_database_relations')
        .select('*')
        .in('source_row_id', rowIds)

      relations = rels || []
    }

    return NextResponse.json({
      ...db,
      rows: rows || [],
      relations,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PUT /api/kb/databases/[id] — update database schema (name, columns, view_type)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.columns !== undefined) updates.columns = body.columns
    if (body.view_type !== undefined) updates.view_type = body.view_type
    if (body.sort_config !== undefined) updates.sort_config = body.sort_config
    if (body.filter_config !== undefined) updates.filter_config = body.filter_config

    const { data, error } = await supabaseAdmin
      .from('kb_databases')
      .update(updates)
      .eq('id', id)
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

// DELETE /api/kb/databases/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { error } = await supabaseAdmin
      .from('kb_databases')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
