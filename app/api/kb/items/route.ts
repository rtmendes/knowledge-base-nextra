import { NextRequest, NextResponse } from 'next/server'
import { getItems } from '../../../../lib/supabase-kb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const categoryId = searchParams.get('category_id') || undefined
    const itemType = searchParams.get('item_type') || undefined
    const search = searchParams.get('q') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const hasContent = searchParams.get('has_content') === 'true'

    const result = await getItems({ categoryId, itemType, search, status, page, limit, hasContent })
    
    return NextResponse.json({
      items: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (err: any) {
    console.error('[api/kb/items] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}
