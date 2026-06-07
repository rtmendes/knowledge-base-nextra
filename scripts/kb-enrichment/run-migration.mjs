#!/usr/bin/env node
/**
 * Run KB enrichment migrations against self-hosted Supabase.
 *
 * Usage:
 *   node scripts/kb-enrichment/run-migration.mjs
 *
 * Reads SQL files in supabase/migrations/*.sql (sorted by filename) and
 * executes them in order via a Postgres connection.
 *
 * Requires either:
 *   - SUPABASE_DB_URL (full postgres connection string), OR
 *   - SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
 *     (uses pg-meta endpoint exposed by self-hosted Supabase)
 *
 * Idempotent — every migration uses IF NOT EXISTS / ON CONFLICT.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
config({ path: join(repoRoot, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const DB_URL       = process.env.SUPABASE_DB_URL  // optional direct postgres URL

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const migrationsDir = join(repoRoot, 'supabase', 'migrations')
const files = (await readdir(migrationsDir))
  .filter(f => f.endsWith('.sql'))
  .sort()

console.log(`Found ${files.length} migration(s):`)
files.forEach(f => console.log('  -', f))

/**
 * Run SQL against Supabase. Prefers direct pg connection if SUPABASE_DB_URL
 * is set; otherwise tries the pg-meta query endpoint.
 */
async function runSql(sql, label) {
  if (DB_URL) {
    // Direct pg path — requires `pg` package
    let pg
    try { pg = await import('pg') } catch {
      console.error('pg package not installed. Run: npm install pg')
      process.exit(1)
    }
    const client = new pg.default.Client({ connectionString: DB_URL })
    await client.connect()
    try {
      await client.query(sql)
      console.log(`✓ ${label} applied via direct pg`)
    } finally {
      await client.end()
    }
    return
  }

  // pg-meta path — self-hosted Supabase exposes /pg/query
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`${label} failed (${res.status}): ${txt.slice(0, 500)}`)
  }
  console.log(`✓ ${label} applied via pg-meta`)
}

for (const file of files) {
  const sql = await readFile(join(migrationsDir, file), 'utf8')
  process.stdout.write(`Applying ${file} ... `)
  try {
    await runSql(sql, file)
  } catch (err) {
    console.error(`\n✗ ${file} failed:`, err.message)
    console.error('\nIf pg-meta endpoint is unavailable on your self-hosted Supabase,')
    console.error('set SUPABASE_DB_URL in .env.local to a direct postgres URL and rerun,')
    console.error('OR paste the SQL into the Supabase Studio SQL editor manually:')
    console.error(`  cat supabase/migrations/${file} | pbcopy`)
    process.exit(1)
  }
}

console.log('\n✅ All migrations applied.')
