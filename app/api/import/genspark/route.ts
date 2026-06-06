import { NextRequest, NextResponse } from 'next/server'
import { logImport } from '../../../../lib/supabase'

const OWNER = 'rtmendes'
const REPO = 'knowledge-base-nextra'
const GH_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

/**
 * Genspark / Manus Content Importer — GitHub-backed
 *
 * POST /api/import/genspark
 * Auth: Bearer {AGENT_API_KEY}
 *
 * Body:
 * {
 *   url:             string   — Genspark/Manus source URL
 *   slug:            string   — target path, e.g. "genspark/my-project"
 *   title?:          string
 *   description?:    string
 *   category?:       string
 *   tags?:           string[]
 *   status?:         'active' | 'draft'
 *   markdownContent? string   — full scraped text/markdown of the page
 *   shareUrl?:       string   — public share link for the page
 *   subLinks?:       { url: string; slug: string; title: string; markdownContent?: string }[]
 *   files?:          { name: string; url: string; type?: string }[]
 *   triggerDeploy?:  boolean  — omit [skip vercel] to force a deployment
 * }
 */

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return true
  return req.headers.get('authorization') === `Bearer ${key}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function sanitizeSlug(raw: string): string {
  return raw.split('/').map(slugify).filter(Boolean).join('/')
}

async function commitFile(
  filePath: string,
  content: string,
  commitMessage: string,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const url = `${GH_API}/${filePath}`
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }

  let existingSha: string | undefined
  try {
    const check = await fetch(url, { headers })
    if (check.ok) existingSha = (await check.json()).sha
  } catch {}

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    return { ok: false, error: err.message || 'GitHub push failed' }
  }
  return { ok: true }
}

function markdownToNodes(md: string): any[] {
  const nodes: any[] = []
  const lines = md.split('\n')
  let inCode = false
  let codeLines: string[] = []
  let codeLang = ''

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        nodes.push({ type: 'code', language: codeLang || 'text', children: [{ text: codeLines.join('\n') }] })
        inCode = false; codeLines = []; codeLang = ''
      } else { inCode = true; codeLang = line.slice(3).trim() }
      continue
    }
    if (inCode) { codeLines.push(line); continue }

    if      (line.startsWith('#### ')) nodes.push({ type: 'heading', level: 4, children: [{ text: line.slice(5) }] })
    else if (line.startsWith('### '))  nodes.push({ type: 'heading', level: 3, children: [{ text: line.slice(4) }] })
    else if (line.startsWith('## '))   nodes.push({ type: 'heading', level: 2, children: [{ text: line.slice(3) }] })
    else if (line.startsWith('# '))    nodes.push({ type: 'heading', level: 1, children: [{ text: line.slice(2) }] })
    else if (line.match(/^[-*+] /))    nodes.push({ type: 'unordered-list', children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: line.slice(2) }] }] }] })
    else if (line.match(/^\d+\. /))    nodes.push({ type: 'ordered-list', children: [{ type: 'list-item', children: [{ type: 'paragraph', children: [{ text: line.replace(/^\d+\. /, '') }] }] }] })
    else if (line.startsWith('> '))    nodes.push({ type: 'blockquote', children: [{ type: 'paragraph', children: [{ text: line.slice(2) }] }] })
    else if (line.trim() === '---')    nodes.push({ type: 'divider', children: [{ text: '' }] })
    else if (line.trim())              nodes.push({ type: 'paragraph', children: [{ text: line }] })
  }

  return nodes
}

function buildMdoc(opts: {
  title: string
  description?: string
  status: string
  category?: string
  tags: string[]
  sourceUrl: string
  shareUrl?: string
  markdownContent?: string
  files?: { name: string; url: string; type?: string }[]
}): string {
  const { title, description, status, category, tags, sourceUrl, shareUrl, markdownContent, files = [] } = opts

  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    ...(description ? [`description: "${description.replace(/"/g, '\\"')}"`] : []),
    `status: "${status}"`,
    ...(category ? [`category: "${category}"`] : []),
    ...(tags.length ? [`tags:\n${tags.map(t => `  - "${t}"`).join('\n')}`] : []),
    `source: genspark`,
    `sourceUrl: "${sourceUrl}"`,
    ...(shareUrl ? [`shareUrl: "${shareUrl}"`] : []),
    `importedAt: "${new Date().toISOString()}"`,
    '---',
    '',
  ].join('\n')

  const nodes: any[] = []

  // Source + share link header
  nodes.push({ type: 'paragraph', children: [{ text: 'Source: ' }, { type: 'link', href: sourceUrl, children: [{ text: sourceUrl }] }] })
  if (shareUrl) {
    nodes.push({ type: 'paragraph', children: [{ text: '🔗 Share: ' }, { type: 'link', href: shareUrl, children: [{ text: shareUrl }] }] })
  }

  // File attachments
  if (files.length > 0) {
    nodes.push({ type: 'heading', level: 2, children: [{ text: 'Project Files' }] })
    for (const f of files) {
      nodes.push({
        type: 'component-block', component: 'FileAttachment',
        props: { url: f.url, filename: f.name, description: '', fileType: f.type || '' },
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      })
    }
  }

  // Page content or iframe embed fallback
  if (markdownContent) {
    nodes.push(...markdownToNodes(markdownContent))
  } else {
    nodes.push({
      type: 'component-block', component: 'EmbedBlock',
      props: { url: sourceUrl, title, height: 800 },
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    })
  }

  return fm + JSON.stringify(nodes)
}

// ── GET: check if a chat is already in the KB ────────────────────────────────
// GET /api/import/genspark?chatId={uuid}
// Returns { exists: boolean, captured: boolean }
export async function GET(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chatId')
  if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 })

  const token = process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json({ exists: false, captured: false })

  // Clean chatId — allow alphanumeric and dashes (UUID format)
  const cleanId = chatId.replace(/[^a-zA-Z0-9-]/g, '')
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  }

  // Check both agent and spark path conventions
  const candidatePaths = [
    `content/docs/genspark/agent/${cleanId}.mdoc`,
    `content/docs/genspark/spark/${cleanId}.mdoc`,
  ]

  for (const filePath of candidatePaths) {
    const res = await fetch(`${GH_API}/${filePath}`, { headers })
    if (res.ok) return NextResponse.json({ exists: true, captured: true, path: filePath })
  }

  return NextResponse.json({ exists: false, captured: false })
}

// ── POST: import one or many chats ───────────────────────────────────────────
// Accepts two formats:
//   A) Extension / extract.py format: { chats: [{ chatId, chatName, shareLink, url, type, capturedAt }] }
//   B) Legacy agent format:           { url, slug, title, ... }
export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const token = process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured on server' }, { status: 500 })

  // ── Format A: { chats: [...] } from Chrome extension or extract.py ─────────
  if (Array.isArray(body.chats)) {
    return handleChatArray(body.chats, token)
  }

  // ── Format B: legacy single-item { url, slug, ... } ──────────────────────
  return handleLegacySingle(body, token)
}

// ─────────────────────────────────────────────────────────────────────────────
// Format A handler — extension / extract.py batch import
// ─────────────────────────────────────────────────────────────────────────────
async function handleChatArray(chats: any[], token: string) {
  if (chats.length === 0) return NextResponse.json({ error: 'chats array is empty' }, { status: 400 })

  const committed: string[] = []
  const errors: string[] = []
  const results: any[] = []

  for (const chat of chats) {
    const { chatId, chatName, shareLink, url: chatUrl, type = 'agent', capturedAt } = chat
    if (!chatId || !chatUrl) {
      errors.push(`skipped entry missing chatId or url`)
      continue
    }

    // Deterministic slug: genspark/{type}/{chatId}
    // chatId is a UUID — safe chars, no transformation needed beyond lower
    const chatType = type === 'spark' ? 'spark' : 'agent'
    const safeSlug = `genspark/${chatType}/${chatId.toLowerCase()}`
    const docTitle = chatName?.trim() || `Chat ${chatId.slice(0, 8)}`
    const capturedDate = capturedAt ? new Date(capturedAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'automatically'
    const description = `Genspark ${chatType} chat captured ${capturedDate}`

    const mdoc = buildMdoc({
      title: docTitle,
      description,
      status: 'active',
      category: `genspark-${chatType}`,
      tags: ['genspark', chatType, 'auto-captured'],
      sourceUrl: chatUrl,
      shareUrl: shareLink || undefined,
    })

    const result = await commitFile(
      `content/docs/${safeSlug}.mdoc`,
      mdoc,
      `kb: import genspark ${chatType} "${docTitle}" [skip vercel]`,
      token,
    )

    if (result.ok) {
      committed.push(`content/docs/${safeSlug}.mdoc`)
      await logImport({ source: 'genspark', url: chatUrl, slug: safeSlug, title: docTitle, status: 'success' })
      results.push({ chatId, slug: safeSlug, ok: true, viewUrl: `https://kb.insightprofit.live/${safeSlug}` })
    } else {
      errors.push(`${chatId}: ${result.error}`)
      await logImport({ source: 'genspark', url: chatUrl, slug: safeSlug, title: docTitle, status: 'error', error: result.error })
      results.push({ chatId, slug: safeSlug, ok: false, error: result.error })
    }
  }

  if (committed.length === 0) return NextResponse.json({ success: false, errors, results }, { status: 500 })

  return NextResponse.json({
    success: true,
    committed,
    results,
    ...(errors.length ? { errors } : {}),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Format B handler — legacy single-item import (agents, other tools)
// ─────────────────────────────────────────────────────────────────────────────
async function handleLegacySingle(body: any, token: string) {
  const {
    url, slug, title, description = '', category, tags = [],
    status = 'active', markdownContent, shareUrl,
    subLinks = [], files = [], triggerDeploy = false,
  } = body

  if (!url || !slug) return NextResponse.json({ error: 'url and slug are required' }, { status: 400 })

  const safeSlug = sanitizeSlug(slug)
  const docTitle = title || safeSlug.split('/').pop()?.replace(/-/g, ' ') || 'Imported Page'
  const skipTag = triggerDeploy ? '' : ' [skip vercel]'
  const committed: string[] = []
  const errors: string[] = []

  // ── Main page ─────────────────────────────────────────────────────────────
  const mainResult = await commitFile(
    `content/docs/${safeSlug}.mdoc`,
    buildMdoc({ title: docTitle, description, status, category, tags, sourceUrl: url, shareUrl, markdownContent, files }),
    `kb: import "${docTitle}"${skipTag}`,
    token,
  )
  if (mainResult.ok) {
    committed.push(`content/docs/${safeSlug}.mdoc`)
    await logImport({ source: 'genspark', url, slug: safeSlug, title: docTitle, status: 'success' })
  } else {
    errors.push(`main: ${mainResult.error}`)
    await logImport({ source: 'genspark', url, slug: safeSlug, title: docTitle, status: 'error', error: mainResult.error })
  }

  // ── Sub-link pages ────────────────────────────────────────────────────────
  for (const sub of subLinks) {
    if (!sub.url || !sub.slug) continue
    const subSlug = sanitizeSlug(sub.slug)
    const subTitle = sub.title || subSlug.split('/').pop()?.replace(/-/g, ' ') || 'Sub Page'
    const subResult = await commitFile(
      `content/docs/${subSlug}.mdoc`,
      buildMdoc({ title: subTitle, description: `Sub-page of ${docTitle}`, status: 'active', category, tags, sourceUrl: sub.url, markdownContent: sub.markdownContent }),
      `kb: import subpage "${subTitle}"${skipTag}`,
      token,
    )
    if (subResult.ok) committed.push(`content/docs/${subSlug}.mdoc`)
    else errors.push(`${subSlug}: ${subResult.error}`)
  }

  if (committed.length === 0) return NextResponse.json({ success: false, errors }, { status: 500 })

  return NextResponse.json({
    success: true,
    committed,
    ...(errors.length ? { errors } : {}),
    viewUrl: `https://kb.insightprofit.live/${safeSlug}`,
    editUrl: `https://kb.insightprofit.live/keystatic/collection/docs/item/${encodeURIComponent(safeSlug)}`,
  })
}
