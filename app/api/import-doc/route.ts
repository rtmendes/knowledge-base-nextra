import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/import-doc — redirect to the import UI page
 */
export async function GET() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  return NextResponse.redirect(new URL('/import', base))
}

/**
 * POST /api/import-doc
 * Body: { content: string, slug?: string, filename?: string }
 *   OR: { url: string }
 *
 * Parses the markdown, extracts frontmatter, and pushes a .mdoc file
 * to the GitHub repo via the GitHub Contents API.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let rawContent: string
    let sourceSlug: string

    // ── Fetch from URL if provided ─────────────────────────────────────────
    if (body.url) {
      const res = await fetch(body.url)
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${res.statusText}` },
          { status: 400 },
        )
      }
      rawContent = await res.text()
      sourceSlug =
        body.url.split('/').pop()?.replace(/\.(md|mdx|txt)$/i, '') ||
        'imported-doc'
    } else if (body.content) {
      rawContent = body.content
      sourceSlug =
        body.slug ||
        (body.filename?.replace(/\.(md|mdx|txt)$/i, '') ?? 'imported-doc')
    } else {
      return NextResponse.json(
        { error: 'Provide either content or url' },
        { status: 400 },
      )
    }

    // ── Parse frontmatter ──────────────────────────────────────────────────
    const { title, description, slug, body: docBody } = parseFrontmatter(
      rawContent,
      sourceSlug,
    )

    // ── Build a minimal .mdoc file ─────────────────────────────────────────
    const mdocContent = buildMdoc({ title, description, slug, body: docBody })

    // ── Push to GitHub ─────────────────────────────────────────────────────
    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      // No token set — return content so the user can copy it manually
      return NextResponse.json({
        title,
        slug,
        description,
        mdoc: mdocContent,
        info: 'No GITHUB_TOKEN set — copy the mdoc field and add it manually via the Keystatic editor.',
      })
    }

    const filePath = `content/docs/${slug}.mdoc`
    const owner = 'rtmendes'
    const repo = 'knowledge-base-nextra'
    const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`
    const headers = {
      Authorization: `token ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }

    // Check for existing file SHA (needed for updates)
    let existingSha: string | undefined
    try {
      const checkRes = await fetch(apiBase, { headers })
      if (checkRes.ok) {
        const existing = await checkRes.json()
        existingSha = existing.sha
      }
    } catch {}

    const pushRes = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `kb: Import "${title}"`,
        content: Buffer.from(mdocContent).toString('base64'),
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    })

    if (!pushRes.ok) {
      const err = await pushRes.json()
      return NextResponse.json(
        { error: err.message || 'GitHub push failed' },
        { status: 500 },
      )
    }

    return NextResponse.json({ title, slug, description, success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 },
    )
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseFrontmatter(raw: string, fallbackSlug: string) {
  let title = ''
  let description = ''
  let slug = fallbackSlug
  let body = raw

  // Extract YAML frontmatter block if present
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/)
  if (fmMatch) {
    const yaml = fmMatch[1]
    body = fmMatch[2]

    const titleMatch = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (titleMatch) title = titleMatch[1].trim()

    const descMatch = yaml.match(/^description:\s*["']?(.+?)["']?\s*$/m)
    if (descMatch) description = descMatch[1].trim()

    const slugMatch = yaml.match(/^slug:\s*["']?(.+?)["']?\s*$/m)
    if (slugMatch) slug = slugMatch[1].trim()
  }

  // Fall back to first H1 for title
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m)
    if (h1Match) {
      title = h1Match[1].trim()
      body = body.replace(h1Match[0], '').trim()
    }
  }

  if (!title) {
    title = slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Sanitise slug
  slug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-/]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return { title, description, slug, body }
}

function buildMdoc({
  title,
  description,
  slug,
  body,
}: {
  title: string
  description: string
  slug: string
  body: string
}) {
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    ...(description ? [`description: "${description.replace(/"/g, '\\"')}"`] : []),
    `slug: "${slug}"`,
    'status: active',
    '---',
  ].join('\n')

  return `${frontmatter}\n\n${body.trim()}\n`
}
