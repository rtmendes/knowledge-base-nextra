import { NextResponse } from 'next/server'
import { getCategories } from '../../../../lib/supabase-kb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories, total: categories.length })
  } catch (err: any) {
    console.error('[api/kb/categories] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
