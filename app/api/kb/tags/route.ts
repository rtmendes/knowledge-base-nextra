import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

// GET /api/kb/tags — list all tags with counts
export async function GET(req: NextRequest) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const searchParams = req.nextUrl.searchParams
  const search = searchParams.get('search') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

  // Fetch all tags from items (Supabase doesn't have unnest in REST API, so we paginate)
  const tagCounts: Record<string, number> = {}
  let offset = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .select('tags')
      .not('tags', 'is', null)
      .range(offset, offset + batchSize - 1)

    if (error || !data || data.length === 0) break

    for (const item of data) {
      for (const tag of (item.tags || [])) {
        if (typeof tag === 'string' && tag.trim()) {
          const t = tag.trim()
          if (!search || t.toLowerCase().includes(search.toLowerCase())) {
            tagCounts[t] = (tagCounts[t] || 0) + 1
          }
        }
      }
    }

    if (data.length < batchSize) break
    offset += batchSize
  }

  // Sort by count descending, then alphabetically
  const tags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))

  return NextResponse.json({ tags, total: Object.keys(tagCounts).length })
}
