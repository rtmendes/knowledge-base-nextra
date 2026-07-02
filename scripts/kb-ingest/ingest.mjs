#!/usr/bin/env node
/**
 * Genspark/Manus export → KB ingestion.
 *
 * Scans a local export folder (markdown, HTML, JSON, txt) and ingests each
 * file into knowledge_items as an EDITABLE copy, preserving the ORIGINAL
 * file verbatim in metadata.original_snapshot.
 *
 * DRY-RUN IS THE DEFAULT — nothing is written until --apply is passed.
 *
 * Usage:
 *   node scripts/kb-ingest/ingest.mjs <folder>                       # dry-run: list what WOULD ingest
 *   node scripts/kb-ingest/ingest.mjs <folder> --category-slug sops  # dry-run with category resolved
 *   node scripts/kb-ingest/ingest.mjs <folder> --category-slug sops --apply
 *
 * Options:
 *   --apply               actually insert (default: dry-run)
 *   --category-slug <s>   kb_categories.slug to file items under (required for --apply)
 *   --item-type <t>       item_type for inserted rows (default: imported;
 *                         use genspark_chat / manus_doc / interactive as appropriate)
 *   --tag <t>             tag added to every item (repeatable; default: ingested)
 *   --limit <n>           cap files processed (default: no cap)
 *
 * Dedupe: skips any file whose derived slug already exists in knowledge_items.
 * Delete-nothing: script only INSERTs — never updates or deletes existing rows.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
config({ path: join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
// Dominant existing user owns ingested refs (knowledge_items.user_id is NOT NULL)
const OWNER_USER_ID = process.env.KB_INGEST_USER_ID || '893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0'
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

// ── Args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const folder = argv.find(a => !a.startsWith('--'))
const APPLY = argv.includes('--apply')
const flag = name => {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : null
}
const flagAll = name =>
  argv.flatMap((a, i) => (a === name && argv[i + 1] ? [argv[i + 1]] : []))

const CATEGORY_SLUG = flag('--category-slug')
const ITEM_TYPE = flag('--item-type') || 'imported'
const TAGS = flagAll('--tag').length ? flagAll('--tag') : ['ingested']
const LIMIT = flag('--limit') ? parseInt(flag('--limit'), 10) : Infinity

if (!folder) {
  console.error('Usage: node scripts/kb-ingest/ingest.mjs <folder> [--apply] [--category-slug <slug>] [--item-type <type>] [--tag <tag>] [--limit <n>]')
  process.exit(1)
}

const SNAPSHOT_MAX = 200_000 // chars — keep original verbatim up to this cap
const EXTS = new Set(['.md', '.markdown', '.html', '.htm', '.json', '.txt'])

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200)
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else if (EXTS.has(extname(name).toLowerCase())) out.push(full)
  }
  return out
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Derive { title, content, contentPlain } per file type. Original stays verbatim in snapshot. */
function extractFile(path) {
  const raw = readFileSync(path, 'utf8')
  const ext = extname(path).toLowerCase()
  const stem = basename(path).replace(/\.[^.]+$/, '')

  if (ext === '.json') {
    // Genspark/Manus chat exports: try common shapes, else pretty-print
    let title = stem
    let content = raw
    try {
      const data = JSON.parse(raw)
      title = data.title || data.name || data.subject || stem
      if (Array.isArray(data.messages)) {
        content = data.messages
          .map(m => `**${m.role || m.author || 'message'}:**\n\n${m.content || m.text || ''}`)
          .join('\n\n---\n\n')
      } else {
        content = '```json\n' + JSON.stringify(data, null, 2) + '\n```'
      }
    } catch {
      /* not valid JSON — ingest raw */
    }
    return { title, content, contentPlain: htmlToText(content) }
  }

  if (ext === '.html' || ext === '.htm') {
    const m = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = (m && htmlToText(m[1])) || stem
    return { title, content: raw, contentPlain: htmlToText(raw) }
  }

  // markdown / txt: first heading or filename as title
  const h = raw.match(/^#\s+(.+)$/m)
  const title = (h && h[1].trim()) || stem
  const contentPlain = raw.replace(/[#*_`[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  return { title, content: raw, contentPlain }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (will insert)' : 'DRY-RUN (no writes)'}`)
  console.log(`Folder: ${folder}\nitem_type: ${ITEM_TYPE}  tags: ${TAGS.join(', ')}\n`)

  // Resolve category
  let categoryId = null
  if (CATEGORY_SLUG) {
    const { data: cat, error } = await supabase
      .from('kb_categories')
      .select('id, name, slug')
      .eq('slug', CATEGORY_SLUG)
      .maybeSingle()
    if (error || !cat) {
      console.error(`Category slug "${CATEGORY_SLUG}" not found in kb_categories`)
      process.exit(1)
    }
    categoryId = cat.id
    console.log(`Category: ${cat.name} (${cat.id})\n`)
  } else if (APPLY) {
    console.error('--apply requires --category-slug (dry-run works without one)')
    process.exit(1)
  }

  const files = walk(folder).slice(0, LIMIT)
  if (files.length === 0) {
    console.log('No ingestible files (.md/.html/.json/.txt) found.')
    return
  }

  let wouldIngest = 0, skipped = 0, inserted = 0, failed = 0

  for (const path of files) {
    const { title, content, contentPlain } = extractFile(path)
    const slug = slugify(title)
    if (!slug) { skipped++; console.log(`SKIP (no slug)  ${path}`); continue }

    // Dedupe by slug — never overwrite existing items
    const { data: existing } = await supabase
      .from('knowledge_items')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (existing) {
      skipped++
      console.log(`SKIP (exists)   ${slug}  ← ${path}`)
      continue
    }

    if (!APPLY) {
      wouldIngest++
      console.log(`WOULD INGEST    ${slug}  "${title}"  (${contentPlain.split(/\s+/).length} words)  ← ${path}`)
      continue
    }

    const raw = readFileSync(path, 'utf8')
    const now = new Date().toISOString()
    const { error } = await supabase.from('knowledge_items').insert({
      user_id: OWNER_USER_ID,
      title,
      slug,
      item_type: ITEM_TYPE,
      category_id: categoryId,
      content,
      content_plain: contentPlain,
      word_count: contentPlain ? contentPlain.split(/\s+/).filter(Boolean).length : 0,
      status: 'active',
      tags: TAGS,
      metadata: {
        source: 'kb-ingest-script',
        source_path: path,
        ingested_at: now,
        original_snapshot: raw.slice(0, SNAPSHOT_MAX),
        original_truncated: raw.length > SNAPSHOT_MAX,
      },
      created_at: now,
      updated_at: now,
    })
    if (error) {
      failed++
      console.error(`FAIL            ${slug}: ${error.message}`)
    } else {
      inserted++
      console.log(`INGESTED        ${slug}  "${title}"`)
    }
  }

  console.log(`\nFiles scanned: ${files.length}`)
  if (APPLY) console.log(`Inserted: ${inserted}  Skipped: ${skipped}  Failed: ${failed}`)
  else console.log(`Would ingest: ${wouldIngest}  Skipped (already in KB): ${skipped}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
