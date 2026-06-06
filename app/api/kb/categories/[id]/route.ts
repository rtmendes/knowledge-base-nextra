import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// PATCH /api/kb/categories/[id] — update a category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, any> = {}
  
  if (body.name !== undefined) {
    updates.name = body.name
    updates.slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  if (body.icon !== undefined) updates.icon = body.icon
  if (body.color !== undefined) updates.color = body.color
  if (body.description !== undefined) updates.description = body.description
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order
  if (body.parent_category_id !== undefined) updates.parent_category_id = body.parent_category_id || null

  const { data, error } = await supabaseAdmin
    .from('kb_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

// DELETE /api/kb/categories/[id] — delete a category (items moved to Uncategorized)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const { id } = await params

  // Find or create "Uncategorized" category
  let { data: uncategorized } = await supabaseAdmin
    .from('kb_categories')
    .select('id')
    .eq('slug', 'uncategorized')
    .single()

  if (!uncategorized) {
    const { data: created } = await supabaseAdmin
      .from('kb_categories')
      .insert({ name: 'Uncategorized', slug: 'uncategorized', icon: 'fas fa-folder', color: '#9ca3af', description: 'Uncategorized items', item_count: 0, sort_order: 999, is_system: true })
      .select()
      .single()
    uncategorized = created
  }

  // Move all items from this category to Uncategorized
  if (uncategorized) {
    await supabaseAdmin
      .from('knowledge_items')
      .update({ category_id: uncategorized.id })
      .eq('category_id', id)
  }

  // Move child categories
  await supabaseAdmin
    .from('kb_categories')
    .update({ parent_category_id: null })
    .eq('parent_category_id', id)

  // Delete the category
  const { error } = await supabaseAdmin
    .from('kb_categories')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
