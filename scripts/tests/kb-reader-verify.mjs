#!/usr/bin/env node
/**
 * KB reader verification — proves SOPs are reachable/queryable by an agent.
 *
 * Checks, in order:
 *   1. GET  /api/kb/catalog?type=sop,department_sop,SOP  → lists all SOPs
 *   2. GET  /api/kb/read/<first SOP slug>                → full doc comes back
 *   3. POST /api/kb/search { query }                     → search returns hits
 *
 * Usage:
 *   node scripts/tests/kb-reader-verify.mjs                                  # against localhost:3000
 *   node scripts/tests/kb-reader-verify.mjs --base https://kb.insightprofit.live
 *   node scripts/tests/kb-reader-verify.mjs --query "agent intercom protocol"
 *
 * Exit code 0 = all checks passed; 1 = any check failed.
 */

const argv = process.argv.slice(2)
const flag = name => {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : null
}
const BASE = (flag('--base') || 'http://localhost:3000').replace(/\/$/, '')
const QUERY = flag('--query') || 'agent intercom protocol'

let failures = 0
const fail = msg => { failures++; console.error(`✗ ${msg}`) }
const pass = msg => console.log(`✓ ${msg}`)

async function main() {
  console.log(`Base: ${BASE}\n`)

  // 1. Catalog — all SOP types
  const catRes = await fetch(`${BASE}/api/kb/catalog?type=sop,department_sop,SOP&limit=500`)
  if (!catRes.ok) {
    fail(`catalog returned HTTP ${catRes.status}`)
    process.exit(1)
  }
  const { docs, total } = await catRes.json()
  if (!Array.isArray(docs) || docs.length === 0) {
    fail('catalog returned zero SOPs')
    process.exit(1)
  }
  pass(`catalog: ${total} SOPs indexed`)

  // 2. Read first SOP by slug
  const first = docs[0]
  const readRes = await fetch(`${BASE}/api/kb/read/${encodeURIComponent(first.slug)}`)
  if (!readRes.ok) {
    fail(`read/${first.slug} returned HTTP ${readRes.status}`)
  } else {
    const { doc } = await readRes.json()
    if (doc && typeof doc.content === 'string' && doc.content.length > 0) {
      pass(`read: "${doc.title}" → ${doc.content.length} chars of content`)
    } else {
      fail(`read/${first.slug} returned empty content`)
    }
  }

  // 3. Search
  const searchRes = await fetch(`${BASE}/api/kb/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, limit: 5 }),
  })
  if (!searchRes.ok) {
    fail(`search returned HTTP ${searchRes.status}`)
  } else {
    const { results, search_type } = await searchRes.json()
    if (Array.isArray(results) && results.length > 0) {
      pass(`search "${QUERY}" (${search_type}): top hit "${results[0].title}"`)
    } else {
      fail(`search "${QUERY}" returned zero results`)
    }
  }

  // SOP readability report
  console.log(`\n── SOP readability report (${docs.length} shown of ${total}) ──`)
  for (const d of docs) {
    console.log(`  [${d.item_type}] ${d.title}  → ${BASE}${d.read_url}`)
  }

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
