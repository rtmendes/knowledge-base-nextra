import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/kb/categories/reorder
// body: { updates: [{ id, parent_category_id, sort_order }] }
// Persists the new tree position (parent + order) for every moved category in one call,
// so the database stays the single source of truth for where each category lives.
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates = Array.isArray(body?.updates) ? body.updates : []
  if (updates.length === 0) return NextResponse.json({ ok: true, updated: 0 })

  // Guard: every update must carry a string id and a numeric sort_order.
  for (const u of updates) {
    if (typeof u?.id !== 'string' || typeof u?.sort_order !== 'number') {
      return NextResponse.json({ error: 'Each update needs id (string) and sort_order (number)' }, { status: 400 })
    }
  }

  const results = await Promise.allSettled(
    updates.map((u: any) =>
      supabaseAdmin!
        .from('kb_categories')
        .update({
          parent_category_id: u.parent_category_id ?? null,
          sort_order: u.sort_order,
        })
        .eq('id', u.id),
    ),
  )

  const failed = results.filter(r => r.status === 'rejected' || (r as any).value?.error)
  if (failed.length) {
    return NextResponse.json(
      { error: `${failed.length} of ${updates.length} updates failed`, updated: updates.length - failed.length },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, updated: updates.length })
}
