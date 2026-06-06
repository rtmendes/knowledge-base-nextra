import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

// POST /api/kb/categories/create — create a new category
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await req.json()
  const { name, icon, color, description, parent_category_id } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  // Check for duplicate slug
  const { data: existing } = await supabaseAdmin
    .from('kb_categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 })
  }

  // Get max sort_order
  const { data: maxSort } = await supabaseAdmin
    .from('kb_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxSort?.sort_order || 0) + 1

  const { data, error } = await supabaseAdmin
    .from('kb_categories')
    .insert({
      name: name.trim(),
      slug,
      icon: icon || 'fas fa-folder',
      color: color || '#6366f1',
      description: description || '',
      item_count: 0,
      sort_order,
      is_system: false,
      parent_category_id: parent_category_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
