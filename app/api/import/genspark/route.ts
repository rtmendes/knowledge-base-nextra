import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { logImport } from '../../../../lib/supabase'

/**
 * Genspark / Manus Content Importer
 *
 * POST /api/import/genspark
 * Body: {
 *   url: string           // Genspark share URL or Manus URL
 *   slug: string          // target slug, e.g. "insightprofit-popebot/my-guide"
 *   title?: string        // override title
 *   category?: string
 *   tags?: string[]
 *   status?: 'active'|'draft'
 *   embedInstead?: boolean  // if true, creates an EmbedBlock page instead of importing content
 * }
 */

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return true
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${key}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function buildDocContent(options: {
  url: string
  title: string
  embedInstead?: boolean
  markdownContent?: string
  description?: string
}): string {
  const { url, title, embedInstead, markdownContent, description } = options

  if (embedInstead) {
    // Create a page that iframes the Genspark/Manus content
    return JSON.stringify([
      {
        type: 'paragraph',
        children: [
          {
            text: description || `Interactive content from ${url}`,
          },
        ],
      },
      {
        type: 'component-block',
        component: 'EmbedBlock',
        props: {
          url,
          title,
          height: 800,
        },
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ])
  }

  if (markdownContent) {
    // Convert markdown paragraphs to Keystatic document nodes
    const lines = markdownContent.split('\n')
    const nodes: any[] = []
    let inCodeBlock = false
    let codeLines: string[] = []
    let codeLang = ''

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          nodes.push({
            type: 'code',
            language: codeLang || 'text',
            children: [{ text: codeLines.join('\n') }],
          })
          inCodeBlock = false
          codeLines = []
          codeLang = ''
        } else {
          inCodeBlock = true
          codeLang = line.slice(3).trim()
        }
        continue
      }
      if (inCodeBlock) { codeLines.push(line); continue }

      if (line.startsWith('# ')) {
        nodes.push({ type: 'heading', level: 1, children: [{ text: line.slice(2) }] })
      } else if (line.startsWith('## ')) {
        nodes.push({ type: 'heading', level: 2, children: [{ text: line.slice(3) }] })
      } else if (line.startsWith('### ')) {
        nodes.push({ type: 'heading', level: 3, children: [{ text: line.slice(4) }] })
      } else if (line.startsWith('#### ')) {
        nodes.push({ type: 'heading', level: 4, children: [{ text: line.slice(5) }] })
      } else if (line.match(/^[-*+] /)) {
        nodes.push({
          type: 'unordered-list',
          children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: line.slice(2) }] }] }],
        })
      } else if (line.match(/^\d+\. /)) {
        nodes.push({
          type: 'ordered-list',
          children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: line.replace(/^\d+\. /, '') }] }] }],
        })
      } else if (line.startsWith('> ')) {
        nodes.push({ type: 'blockquote', children: [{ type: 'paragraph', children: [{ text: line.slice(2) }] }] })
      } else if (line.startsWith('---') && line.trim() === '---') {
        nodes.push({ type: 'divider', children: [{ text: '' }] })
      } else if (line.trim()) {
        nodes.push({ type: 'paragraph', children: [{ text: line }] })
      }
    }

    return JSON.stringify(nodes)
  }

  // Default: stub page with source link
  return JSON.stringify([
    {
      type: 'paragraph',
      children: [{ text: `Source: ${url}` }],
    },
    {
      type: 'component-block',
      component: 'EmbedBlock',
      props: { url, title, height: 700 },
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
  ])
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    url,
    slug,
    title,
    category,
    tags = [],
    status = 'active',
    embedInstead = false,
    description = '',
  } = body

  if (!url || !slug) {
    return NextResponse.json({ error: 'url and slug are required' }, { status: 400 })
  }

  const safeSlug = slug
    .split('/')
    .map(slugify)
    .join('/')

  const docTitle = title || slug.split('/').pop()?.replace(/-/g, ' ') || 'Imported Page'

  let fetchedMarkdown: string | undefined
  let fetchedTitle = docTitle

  // Attempt to fetch content from URL if not embed mode
  if (!embedInstead) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'InsightProfit-KB-Bot/1.0' },
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const html = await res.text()
        // Extract title from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch) fetchedTitle = titleMatch[1].replace(' | Genspark', '').trim()
        // We can't easily extract clean markdown from HTML here without a parser
        // The page will be embedded; for real content extraction, use the /api/import/upload endpoint
      }
    } catch {
      // Fetch failed — will create embed page instead
    }
  }

  const finalTitle = title || fetchedTitle || docTitle
  const contentJson = buildDocContent({
    url,
    title: finalTitle,
    embedInstead: embedInstead || !fetchedMarkdown,
    markdownContent: fetchedMarkdown,
    description,
  })

  // Build the .mdoc file content (YAML frontmatter + JSON content)
  const frontmatter = [
    `title: "${finalTitle.replace(/"/g, '\\"')}"`,
    description ? `description: "${description.replace(/"/g, '\\"')}"` : '',
    `status: "${status}"`,
    category ? `category: "${category}"` : '',
    tags.length ? `tags:\n${tags.map((t: string) => `  - "${t}"`).join('\n')}` : '',
    `source: genspark`,
    `sourceUrl: "${url}"`,
    `importedAt: "${new Date().toISOString()}"`,
  ]
    .filter(Boolean)
    .join('\n')

  const mdocContent = `---\n${frontmatter}\n---\n\n${contentJson}`

  // Write to content/docs/[slug].mdoc
  const parts = safeSlug.split('/')
  const dir = join(process.cwd(), 'content', 'docs', ...parts.slice(0, -1))
  const filename = `${parts[parts.length - 1]}.mdoc`
  const filepath = join(dir, filename)

  try {
    await mkdir(dir, { recursive: true })
    await writeFile(filepath, mdocContent, 'utf-8')

    await logImport({
      source: 'genspark',
      url,
      slug: safeSlug,
      title: finalTitle,
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      slug: safeSlug,
      title: finalTitle,
      file: `content/docs/${safeSlug}.mdoc`,
      viewUrl: `https://kb.insightprofit.live/${safeSlug}`,
      editUrl: `https://kb.insightprofit.live/keystatic/collection/docs/item/${encodeURIComponent(safeSlug)}`,
      note: 'File written to repo. Commit and push to deploy, or use Keystatic admin to review.',
    })
  } catch (err: any) {
    await logImport({
      source: 'genspark',
      url,
      slug: safeSlug,
      title: finalTitle,
      status: 'error',
      error: err.message,
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
