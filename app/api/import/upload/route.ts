import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { uploadToSupabase, logImport } from '../../../../lib/supabase'

/**
 * File Upload & Import Endpoint
 *
 * POST /api/import/upload  (multipart/form-data)
 * Fields:
 *   file        — the file to upload (any format)
 *   slug        — target doc slug, e.g. "popebot/my-doc"
 *   title       — display title (optional, derived from filename if omitted)
 *   category    — optional
 *   tags        — comma-separated tags (optional)
 *   status      — active|draft  (default: active)
 *   asMedia     — if "true", just store in Supabase and return URL (no doc created)
 *
 * Supported doc imports: .md, .txt, .html (converted to a rendered page)
 * Media files: images, PDFs, videos → stored in Supabase Storage → embedded in page
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

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi']
const DOC_EXTS = ['.md', '.mdx', '.txt', '.html']

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const rawSlug = (formData.get('slug') as string) || slugify(file.name.replace(/\.[^.]+$/, ''))
  const slug = rawSlug.split('/').map(slugify).join('/')
  const title = (formData.get('title') as string) || file.name.replace(/\.[^.]+$/, '')
  const category = (formData.get('category') as string) || ''
  const tagsRaw = (formData.get('tags') as string) || ''
  const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
  const status = (formData.get('status') as string) || 'active'
  const asMedia = formData.get('asMedia') === 'true'

  const ext = extname(file.name).toLowerCase()
  const bytes = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'application/octet-stream'

  // ── Media-only upload (image, video, PDF, etc.) ──────────────────────────
  if (asMedia || IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext) || ext === '.pdf') {
    const storagePath = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const publicUrl = await uploadToSupabase('kb-media', storagePath, bytes, contentType)

    if (!publicUrl) {
      // Fallback: save to public/uploads
      const localDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(localDir, { recursive: true })
      const localPath = join(localDir, `${Date.now()}-${file.name.replace(/\s+/g, '-')}`)
      await writeFile(localPath, bytes)
      const localUrl = `/uploads/${localPath.split('/').pop()}`

      if (asMedia) return NextResponse.json({ url: localUrl, filename: file.name })

      return buildMediaPage({ slug, title, url: localUrl, ext, tags, category, status, filename: file.name })
    }

    if (asMedia) return NextResponse.json({ url: publicUrl, filename: file.name })

    return buildMediaPage({ slug, title, url: publicUrl, ext, tags, category, status, filename: file.name })
  }

  // ── Document import (.md, .txt, .html) ───────────────────────────────────
  if (DOC_EXTS.includes(ext)) {
    const text = bytes.toString('utf-8')
    let markdown = text

    // Strip HTML to plain text if needed (basic)
    if (ext === '.html') {
      markdown = text
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()
    }

    // Build minimal Keystatic document JSON from markdown
    const lines = markdown.split('\n')
    const nodes: any[] = []
    for (const line of lines) {
      if (!line.trim()) continue
      if (line.startsWith('# '))  nodes.push({ type: 'heading', level: 1, children: [{ text: line.slice(2) }] })
      else if (line.startsWith('## ')) nodes.push({ type: 'heading', level: 2, children: [{ text: line.slice(3) }] })
      else if (line.startsWith('### ')) nodes.push({ type: 'heading', level: 3, children: [{ text: line.slice(4) }] })
      else if (line.match(/^[-*+] /)) nodes.push({ type: 'unordered-list', children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: line.slice(2) }] }] }] })
      else nodes.push({ type: 'paragraph', children: [{ text: line }] })
    }

    return writeMdocFile({ slug, title, category, tags, status, nodes, source: file.name })
  }

  // ── Unknown format — store as file attachment ─────────────────────────────
  const storagePath = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const publicUrl = await uploadToSupabase('kb-media', storagePath, bytes, contentType) || '#'

  const nodes = [
    {
      type: 'paragraph',
      children: [{ text: `File: ${file.name} (${(bytes.length / 1024).toFixed(1)} KB)` }],
    },
    {
      type: 'component-block',
      component: 'FileAttachment',
      props: {
        url: publicUrl,
        filename: file.name,
        description: `Uploaded ${new Date().toLocaleDateString()}`,
        fileType: 'other',
      },
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    },
  ]

  return writeMdocFile({ slug, title, category, tags, status, nodes, source: file.name })
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function buildMediaPage(opts: {
  slug: string; title: string; url: string; ext: string
  tags: string[]; category: string; status: string; filename: string
}) {
  const { slug, title, url, ext, tags, category, status, filename } = opts
  const isVideo = VIDEO_EXTS.includes(ext)
  const isImage = IMAGE_EXTS.includes(ext)

  const nodes = isVideo
    ? [{ type: 'component-block', component: 'VideoEmbed', props: { url, caption: title }, children: [{ type: 'paragraph', children: [{ text: '' }] }] }]
    : isImage
    ? [{ type: 'image', src: url, alt: title, title, children: [{ text: '' }] }]
    : [{ type: 'component-block', component: 'FileAttachment', props: { url, filename, fileType: 'pdf', description: '' }, children: [{ type: 'paragraph', children: [{ text: '' }] }] }]

  return writeMdocFile({ slug, title, category, tags, status, nodes, source: filename })
}

async function writeMdocFile(opts: {
  slug: string; title: string; category: string
  tags: string[]; status: string; nodes: any[]; source?: string
}): Promise<NextResponse> {
  const { slug, title, category, tags, status, nodes, source } = opts

  const frontmatter = [
    `title: "${title.replace(/"/g, '\\"')}"`,
    `status: "${status}"`,
    category ? `category: "${category}"` : '',
    tags.length ? `tags:\n${tags.map((t) => `  - "${t}"`).join('\n')}` : '',
    source ? `importedFrom: "${source}"` : '',
    `importedAt: "${new Date().toISOString()}"`,
  ].filter(Boolean).join('\n')

  const mdocContent = `---\n${frontmatter}\n---\n\n${JSON.stringify(nodes)}`

  const parts = slug.split('/')
  const dir = join(process.cwd(), 'content', 'docs', ...parts.slice(0, -1))
  const filepath = join(dir, `${parts[parts.length - 1]}.mdoc`)

  try {
    await mkdir(dir, { recursive: true })
    await writeFile(filepath, mdocContent, 'utf-8')

    await logImport({ source: source || 'upload', slug, title, status: 'success' })

    return NextResponse.json({
      success: true,
      slug,
      title,
      file: `content/docs/${slug}.mdoc`,
      viewUrl: `https://kb.insightprofit.live/${slug}`,
      editUrl: `https://kb.insightprofit.live/keystatic/collection/docs/item/${encodeURIComponent(slug)}`,
    })
  } catch (err: any) {
    await logImport({ source: source || 'upload', slug, title, status: 'error', error: err.message })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
