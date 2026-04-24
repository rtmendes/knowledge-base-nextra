import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// GET /api/kb/databases — list all databases (optionally filter by parent_item_id)
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const parentItemId = request.nextUrl.searchParams.get('parent_item_id')

    let query = supabaseAdmin
      .from('kb_databases')
      .select('*')
      .order('created_at', { ascending: false })

    if (parentItemId) {
      query = query.eq('parent_item_id', parentItemId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/kb/databases — create a new inline database
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { name, parent_item_id, columns, view_type, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Default columns if none provided
    const defaultColumns = columns || [
      { id: 'col_title', name: 'Name', type: 'title', width: 250 },
      { id: 'col_status', name: 'Status', type: 'select', options: ['Active', 'In Progress', 'Done'], width: 130 },
      { id: 'col_tags', name: 'Tags', type: 'multi_select', options: [], width: 180 },
    ]

    const { data, error } = await supabaseAdmin
      .from('kb_databases')
      .insert({
        name,
        description: description || '',
        parent_item_id: parent_item_id || null,
        columns: defaultColumns,
        view_type: view_type || 'table',
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
