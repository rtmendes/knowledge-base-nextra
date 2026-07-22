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

    // ── Enrich on write: embedding + summary (non-fatal) ─────────────────────
    let embedding: number[] | null = null
    try {
      const embRes = await fetch(
        `${process.env.EMBED_SERVICE_URL || 'https://embed.insightprofit.live'}/embed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: [`${title.trim()}\n\n${contentPlain.slice(0, 2000)}`] }),
        }
      )
      if (embRes.ok) {
        const { embeddings } = await embRes.json()
        embedding = Array.isArray(embeddings?.[0]) ? embeddings[0] : null
      }
    } catch { /* embed service unavailable — item still saves */ }

    const insertPayload: Record<string, any> = {
      user_id: '893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0',
      title: title.trim(),
      slug,
      item_type: item_type || 'imported',
      category_id,
      content: content || '',
      content_plain: contentPlain,
      word_count: wordCount,
      status: status || 'active',
      tags: tags || [],
      summary: contentPlain.slice(0, 200) || null,
      metadata: {},
      created_at: now,
      updated_at: now,
    }
    if (embedding) insertPayload.embedding = JSON.stringify(embedding)

    let { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert(insertPayload)
      .select('id, title, slug')
      .single()

    // Retry without enrichment columns if schema predates them
    if (error && /embedding|summary/.test(error.message || '')) {
      delete insertPayload.embedding
      delete insertPayload.summary
      ;({ data, error } = await supabaseAdmin
        .from('knowledge_items')
        .insert(insertPayload)
        .select('id, title, slug')
        .single())
    }

    if (error) {
      console.error('[api/kb/items/create] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create item', details: error.message },
        { status: 500 }
      )
    }

    // Update category item count
    try {
      await supabaseAdmin.rpc('increment_category_count', { cat_id: category_id })
    } catch {
      // If RPC doesn't exist, manually update — non-fatal
      try {
        await supabaseAdmin
          .from('kb_categories')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', category_id)
      } catch {
        // Silently ignore — category count is non-critical
      }
    }

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
