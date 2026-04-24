import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

// PATCH /api/kb/items/[id]/move — move item to a different category or parent
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await req.json()
  const { category_id, parent_id } = body

  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  if (category_id !== undefined) updates.category_id = category_id
  if (parent_id !== undefined) updates.parent_id = parent_id || null

  const { data, error } = await supabaseAdmin
    .from('knowledge_items')
    .update(updates)
    .eq('id', params.id)
    .select('id, title, category_id, parent_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
