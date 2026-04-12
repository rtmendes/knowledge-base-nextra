import { NextRequest, NextResponse } from 'next/server'
import { reader } from '../../../lib/keystatic'

/**
 * AI Agent API — allows PopeBot and other agents to read & list KB content.
 *
 * Auth: Bearer token via AGENT_API_KEY env var.
 *
 * GET  /api/agent?action=list                   → list all docs
 * GET  /api/agent?action=get&slug=popebot/guide → get one doc
 * GET  /api/agent?action=projects               → list all projects
 * POST /api/agent  { action: 'search', query }  → search titles & descriptions
 */

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return true // no key configured = open access (dev mode)
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${key}`
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'list'

  try {
    if (action === 'list') {
      const docs = await reader.collections.docs.all()
      return NextResponse.json({
        docs: docs.map((d) => ({
          slug: d.slug,
          title: d.entry.title,
          description: d.entry.description,
          status: d.entry.status,
          category: d.entry.category,
          tags: d.entry.tags,
          order: d.entry.order,
          url: `https://kb.insightprofit.live/${d.slug}`,
        })),
      })
    }

    if (action === 'get') {
      const slug = searchParams.get('slug')
      if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

      const doc = await reader.collections.docs.read(slug)
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const content = await doc.content()
      return NextResponse.json({
        slug,
        title: doc.title,
        description: doc.description,
        status: doc.status,
        category: doc.category,
        tags: doc.tags,
        content, // raw document tree (Keystatic format)
        url: `https://kb.insightprofit.live/${slug}`,
        editUrl: `https://kb.insightprofit.live/keystatic/collection/docs/item/${encodeURIComponent(slug)}`,
      })
    }

    if (action === 'projects') {
      const projects = await reader.collections.projects.all()
      return NextResponse.json({
        projects: projects.map((p) => ({
          slug: p.slug,
          name: p.entry.name,
          description: p.entry.description,
          status: p.entry.status,
          category: p.entry.category,
          url: p.entry.url,
          docsSlug: p.entry.docsSlug,
          tags: p.entry.tags,
          priority: p.entry.priority,
        })),
      })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err) {
    console.error('[agent] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, query } = body

    if (action === 'search') {
      if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

      const docs = await reader.collections.docs.all()
      const q = query.toLowerCase()

      const results = docs
        .filter(
          (d) =>
            d.entry.title.toLowerCase().includes(q) ||
            (d.entry.description ?? '').toLowerCase().includes(q) ||
            (d.entry.tags ?? []).some((t: string) => t.toLowerCase().includes(q)) ||
            (d.entry.category ?? '').toLowerCase().includes(q)
        )
        .map((d) => ({
          slug: d.slug,
          title: d.entry.title,
          description: d.entry.description,
          tags: d.entry.tags,
          url: `https://kb.insightprofit.live/${d.slug}`,
        }))

      return NextResponse.json({ results, total: results.length })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err) {
    console.error('[agent] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
