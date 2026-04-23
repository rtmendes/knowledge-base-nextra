import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (content === undefined || content === null) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Strip HTML to get plain text for search indexing
    const contentPlain = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&#x27;/gi, "'")
      .replace(/&rsquo;/gi, "'")
      .replace(/&lsquo;/gi, "'")
      .replace(/&rdquo;/gi, '"')
      .replace(/&ldquo;/gi, '"')
      .replace(/&mdash;/gi, '—')
      .replace(/&ndash;/gi, '–')
      .replace(/&hellip;/gi, '…')
      .replace(/\s+/g, ' ')
      .trim()

    // Count words
    const wordCount = contentPlain
      ? contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length
      : 0

    const now = new Date().toISOString()

    const { error } = await supabaseAdmin
      .from('knowledge_items')
      .update({
        content,
        content_plain: contentPlain,
        word_count: wordCount,
        updated_at: now,
      })
      .eq('id', id)

    if (error) {
      console.error('[api/kb/items/update] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update item', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      word_count: wordCount,
      updated_at: now,
    })
  } catch (err: any) {
    console.error('[api/kb/items/update] Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
