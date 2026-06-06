import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase'

/**
 * GET /api/auto-deploy
 *
 * Called by the Vercel cron every 30 minutes.
 * Fires the deploy hook only if there were imports in the last 35 minutes,
 * so the KB stays in sync with whatever the Chrome extension scraped
 * without any manual intervention.
 *
 * Vercel passes VERCEL_CRON_SECRET as an Authorization header when invoking crons.
 */
export async function GET(req: NextRequest) {
  // Verify this is a legitimate cron invocation (or internal call)
  const cronSecret = process.env.VERCEL_CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) {
    return NextResponse.json({ skipped: true, reason: 'VERCEL_DEPLOY_HOOK_URL not set' })
  }

  // Check for any successful imports in the last 35 minutes
  let recentImports = 0
  if (supabaseAdmin) {
    const since = new Date(Date.now() - 35 * 60 * 1000).toISOString()
    const { count } = await supabaseAdmin
      .from('imports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('created_at', since)
    recentImports = count ?? 0
  }

  if (recentImports === 0) {
    return NextResponse.json({ skipped: true, reason: 'No recent imports — deploy not needed' })
  }

  // Fire the deploy hook
  const res = await fetch(hookUrl, { method: 'POST' })
  if (!res.ok) {
    return NextResponse.json(
      { error: `Deploy hook returned ${res.status}` },
      { status: 500 },
    )
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json({
    triggered: true,
    recentImports,
    jobId: data.job?.id,
    deployUrl: 'https://kb.insightprofit.live',
  })
}
