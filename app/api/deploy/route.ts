import { NextRequest, NextResponse } from 'next/server'

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return false // SECURITY: deny if no key configured (was: allow)
  return req.headers.get('authorization') === `Bearer ${key}`
}

/**
 * POST /api/deploy
 * Auth: Bearer {AGENT_API_KEY}
 *
 * Immediately triggers a Vercel production deployment via the deploy hook.
 * Call this from the Chrome extension when a bulk scraping session completes.
 *
 * Body (all optional):
 * { message?: string }
 *
 * No manual curl required — the cron at /api/auto-deploy also fires this
 * automatically every 30 minutes whenever there have been recent imports.
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) return NextResponse.json({ error: 'VERCEL_DEPLOY_HOOK_URL not configured' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch {}

  const res = await fetch(hookUrl, { method: 'POST' })
  if (!res.ok) {
    return NextResponse.json({ error: `Deploy hook returned ${res.status}` }, { status: 500 })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    jobId: data.job?.id,
    message: body.message || 'Deploy triggered',
    deployUrl: 'https://kb.insightprofit.live',
  })
}
