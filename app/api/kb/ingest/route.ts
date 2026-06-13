import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

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
    const { url, category_id, tags } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'FIRECRAWL_API_KEY not configured' }, { status: 500 })
    }

    // Scrape via Firecrawl
    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!scrapeRes.ok) {
      const errText = await scrapeRes.text()
      console.error('[api/kb/ingest] Firecrawl error:', scrapeRes.status, errText)
      return NextResponse.json(
        { error: `Firecrawl scrape failed (${scrapeRes.status})` },
        { status: 502 }
      )
    }

    const scrapeData = await scrapeRes.json()

    if (!scrapeData.success) {
      return NextResponse.json({ error: 'Firecrawl returned unsuccessful response' }, { status: 502 })
    }

    const markdown = scrapeData.data?.markdown || ''
    const pageTitle = scrapeData.data?.metadata?.title || parsedUrl.hostname

    const slug = slugify(pageTitle)
    const contentPlain = markdown.replace(/[#*_`[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = contentPlain ? contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length : 0
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert({
        title: pageTitle.trim(),
        slug,
        item_type: 'imported',
        category_id,
        content: markdown,
        content_plain: contentPlain,
        word_count: wordCount,
        status: 'active',
        tags: tags || [],
        metadata: { source_url: url, scraped_at: now },
        created_at: now,
        updated_at: now,
      })
      .select('id, title, slug')
      .single()

    if (error) {
      console.error('[api/kb/ingest] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save item', details: error.message }, { status: 500 })
    }

    // Update category item count (non-fatal if RPC missing)
    try {
      await supabaseAdmin.rpc('increment_category_count', { cat_id: category_id })
    } catch { /* non-critical */ }

    return NextResponse.json({ id: data.id, title: data.title, slug: data.slug, created: true })
  } catch (err: any) {
    console.error('[api/kb/ingest] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
