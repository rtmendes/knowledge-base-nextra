import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Extract authenticated user from middleware headers
    const authUid = request.headers.get('x-auth-uid') || 'unknown'
    const authEmail = request.headers.get('x-auth-email') || 'unknown'

    const body = await request.json()
    const { content } = body

    if (content === undefined || content === null) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // ── Save current content as a version before overwriting ─────────────

    const { data: currentItem } = await supabaseAdmin
      .from('knowledge_items')
      .select('content, content_plain, word_count')
      .eq('id', id)
      .single()

    if (currentItem && currentItem.content) {
      // Get latest version number for this item
      const { data: latestVersion } = await supabaseAdmin
        .from('knowledge_item_versions')
        .select('version_number')
        .eq('item_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (latestVersion?.version_number || 0) + 1

      // Save version snapshot
      await supabaseAdmin.from('knowledge_item_versions').insert({
        item_id: id,
        content: currentItem.content,
        content_plain: currentItem.content_plain,
        word_count: currentItem.word_count || 0,
        edited_by: authEmail,
        version_number: nextVersion,
      })
    }

    // ── Strip HTML to get plain text for search indexing ─────────────────

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
