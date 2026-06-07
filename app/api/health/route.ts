import { NextResponse } from 'next/server'

/**
 * Rollup health endpoint for kb.insightprofit.live.
 *
 * Pings every downstream that "Chief of Staff" depends on so command-center
 * (and any other monitor) can show one green dot instead of polling N places.
 *
 * Downstreams probed:
 *   - Supabase  → GET https://supabase.insightprofit.live/rest/v1/  (anon key in header)
 *   - kb-api    → GET https://kb-api.insightprofit.live/system-health
 *
 * Contract:
 *   200 OK always (unless the route itself throws). Body always parses.
 *   {
 *     ok: boolean,                     // true ONLY if every downstream is up
 *     ts: string,                      // ISO timestamp
 *     hasGithubToken: boolean,         // env-var presence (kept for back-compat)
 *     downstreams: {
 *       supabase: { ok, status, ms, error? },
 *       kbApi:    { ok, status, ms, error? },
 *     }
 *   }
 *
 * Monitors should read `ok` from the body, not the HTTP status. Reserving 5xx
 * for "the rollup route itself blew up" keeps partial degradations from
 * triggering alert storms in command-center.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPABASE_URL = 'https://supabase.insightprofit.live'
const SUPABASE_ANON =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2ODcxMjQ0LCJleHAiOjIwODIyMzEyNDR9.qtJF1pWQQr-SGHVYLv0wP4hMiamqfjrNsfsnBm-c2hI'
const KB_API_URL = 'https://kb-api.insightprofit.live/system-health'
const PROBE_TIMEOUT_MS = 4000

type Probe = { ok: boolean; status: number; ms: number; error?: string }

async function probe(url: string, init: RequestInit = {}): Promise<Probe> {
  const start = Date.now()
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), PROBE_TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...init, signal: ac.signal, cache: 'no-store' })
    return { ok: res.ok, status: res.status, ms: Date.now() - start }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - start,
      error: err instanceof Error ? err.message : 'fetch_failed',
    }
  } finally {
    clearTimeout(t)
  }
}

export async function GET() {
  const [supabase, kbApi] = await Promise.all([
    probe(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    }),
    probe(KB_API_URL),
  ])

  const ok = supabase.ok && kbApi.ok

  return NextResponse.json(
    {
      ok,
      ts: new Date().toISOString(),
      hasGithubToken: !!process.env.GITHUB_TOKEN,
      downstreams: { supabase, kbApi },
    },
    { status: 200 },
  )
}
