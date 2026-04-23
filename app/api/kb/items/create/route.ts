import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200)
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { title, category_id, item_type, content, status, tags } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const slug = slugify(title)
    const now = new Date().toISOString()

    // Generate plain text from content
    const contentPlain = (content || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const wordCount = contentPlain
      ? contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length
      : 0

    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert({
        title: title.trim(),
        slug,
        item_type: item_type || 'imported',
        category_id,
        content: content || '',
        content_plain: contentPlain,
        word_count: wordCount,
        status: status || 'active',
        tags: tags || [],
        metadata: {},
        created_at: now,
        updated_at: now,
      })
      .select('id, title, slug')
      .single()

    if (error) {
      console.error('[api/kb/items/create] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create item', details: error.message },
        { status: 500 }
      )
    }

    // Update category item count
    await supabaseAdmin.rpc('increment_category_count', { cat_id: category_id }).catch(() => {
      // If RPC doesn't exist, manually update
      return supabaseAdmin
        .from('kb_categories')
        .update({ item_count: supabaseAdmin.rpc ? undefined : 0 })
        .eq('id', category_id)
    })

    return NextResponse.json({
      id: data.id,
      title: data.title,
      slug: data.slug,
      created: true,
    })
  } catch (err: any) {
    console.error('[api/kb/items/create] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
