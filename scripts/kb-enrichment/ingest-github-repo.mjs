#!/usr/bin/env node
/**
 * Ingest external GitHub repos as knowledge_items so Chief of Staff can reason
 * about them. Fetches README + docs/ + ADRs only — NOT source code (would
 * dilute search).
 *
 * Usage:
 *   node scripts/kb-enrichment/ingest-github-repo.mjs <owner>/<repo> [--brand research]
 *   node scripts/kb-enrichment/ingest-github-repo.mjs RyjoxTechnologies/Octopoda-OS --brand research
 *   node scripts/kb-enrichment/ingest-github-repo.mjs seojoonkim/memkraft --brand research
 *
 * Each ingested file becomes a knowledge_items row:
 *   - item_type: 'external-reference'
 *   - brand: from --brand flag (default 'research')
 *   - tags: ['github', '<owner>', '<repo>', file extension]
 *   - source_url stored in tags as 'src:<url>' (no schema change needed)
 *
 * Idempotent — re-running updates existing items by title match.
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
config({ path: join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const GH_TOKEN     = process.env.GITHUB_TOKEN  // optional, raises rate limit

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars in .env.local')
  process.exit(1)
}

const argv = process.argv.slice(2)
const repo = argv.find(a => !a.startsWith('--'))
if (!repo || !repo.includes('/')) {
  console.error('Usage: node ingest-github-repo.mjs <owner>/<repo> [--brand <brand>]')
  process.exit(1)
}
const brandIdx = argv.indexOf('--brand')
const brand = brandIdx >= 0 ? argv[brandIdx + 1] : 'research'
const [owner, name] = repo.split('/')

const ghHeaders = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'kb-enrichment-ingester',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: ghHeaders })
  if (!res.ok) throw new Error(`GitHub ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function ghRaw(downloadUrl) {
  const res = await fetch(downloadUrl, { headers: ghHeaders })
  if (!res.ok) throw new Error(`Raw fetch failed: ${res.status}`)
  return res.text()
}

console.log(`Ingesting ${owner}/${name} as brand=${brand}...`)

// Get default branch
const repoInfo = await gh(`/repos/${owner}/${name}`)
const defaultBranch = repoInfo.default_branch
console.log(`  default branch: ${defaultBranch}`)
console.log(`  description: ${repoInfo.description}`)

// Get tree
const tree = await gh(`/repos/${owner}/${name}/git/trees/${defaultBranch}?recursive=1`)

// Filter to docs only — .md files at root or under docs/ adr/ rfcs/
const RX = /^(README|CONTRIBUTING|ARCHITECTURE|CHANGELOG)\.md$|^(docs|adr|adrs|rfcs|spec|specs|rfc)\/.+\.(md|mdx)$/i
const targets = tree.tree
  .filter(n => n.type === 'blob' && RX.test(n.path))
  .slice(0, 50)  // sanity cap

console.log(`  ${targets.length} doc file(s) to ingest:`)
targets.forEach(t => console.log(`    - ${t.path}`))

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

let count = 0
for (const node of targets) {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${name}/${defaultBranch}/${node.path}`
  let content
  try { content = await ghRaw(rawUrl) }
  catch (e) { console.error(`  skip ${node.path}:`, e.message); continue }

  const title = `${owner}/${name}: ${node.path}`
  const sourceUrl = `https://github.com/${owner}/${name}/blob/${defaultBranch}/${node.path}`

  // Strip markdown for content_plain (rough — full strip would need a parser)
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const summary = plain.slice(0, 200).replace(/\s+/g, ' ')
  const word_count = plain.split(/\s+/).filter(Boolean).length

  const row = {
    title,
    content: content.slice(0, 50000),
    content_plain: plain.slice(0, 50000),
    item_type: 'external-reference',
    tags: ['github', owner, name, `path:${node.path}`, `src:${sourceUrl}`],
    word_count,
    brand,
    summary,
  }

  // Upsert by title (unique-ish for external refs)
  const { error } = await supabase
    .from('knowledge_items')
    .upsert(row, { onConflict: 'title' })

  if (error) console.error(`  fail ${node.path}:`, error.message)
  else { count++; console.log(`  ✓ ${node.path} (${word_count} words)`) }
}

console.log(`\n✅ Ingested ${count} doc(s) from ${owner}/${name}`)
console.log('Next: run embed-kb-items.mjs --backfill to vector-index them.')
