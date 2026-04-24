import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

// POST /api/kb/items/bulk — bulk move, delete, or tag items
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const body = await req.json()
  const { action, item_ids, category_id, tags_add, tags_remove } = body

  if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
    return NextResponse.json({ error: 'item_ids required' }, { status: 400 })
  }

  if (item_ids.length > 200) {
    return NextResponse.json({ error: 'Max 200 items per bulk operation' }, { status: 400 })
  }

  const results: { success: number; errors: string[] } = { success: 0, errors: [] }

  switch (action) {
    case 'move': {
      if (!category_id) return NextResponse.json({ error: 'category_id required for move' }, { status: 400 })
      const { error, count } = await supabaseAdmin
        .from('knowledge_items')
        .update({ category_id, updated_at: new Date().toISOString() })
        .in('id', item_ids)
      if (error) results.errors.push(error.message)
      else results.success = count || item_ids.length
      break
    }

    case 'delete': {
      const { error, count } = await supabaseAdmin
        .from('knowledge_items')
        .delete()
        .in('id', item_ids)
      if (error) results.errors.push(error.message)
      else results.success = count || item_ids.length
      break
    }

    case 'tag': {
      // Process items one by one to handle tag arrays properly
      for (const id of item_ids) {
        const { data: item, error: fetchErr } = await supabaseAdmin
          .from('knowledge_items')
          .select('tags')
          .eq('id', id)
          .single()

        if (fetchErr) { results.errors.push(`${id}: ${fetchErr.message}`); continue }

        let currentTags: string[] = item?.tags || []
        if (tags_add) currentTags = [...new Set([...currentTags, ...tags_add])]
        if (tags_remove) currentTags = currentTags.filter(t => !tags_remove.includes(t))

        const { error: updateErr } = await supabaseAdmin
          .from('knowledge_items')
          .update({ tags: currentTags, updated_at: new Date().toISOString() })
          .eq('id', id)

        if (updateErr) results.errors.push(`${id}: ${updateErr.message}`)
        else results.success++
      }
      break
    }

    case 'set_parent': {
      const { parent_id } = body
      const { error, count } = await supabaseAdmin
        .from('knowledge_items')
        .update({ parent_id: parent_id || null, updated_at: new Date().toISOString() })
        .in('id', item_ids)
      if (error) results.errors.push(error.message)
      else results.success = count || item_ids.length
      break
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  return NextResponse.json(results)
}
