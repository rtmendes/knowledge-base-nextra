import { NextRequest, NextResponse } from 'next/server'

const OWNER = 'rtmendes'
const REPO = 'knowledge-base-nextra'
const GH_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`

function authorize(req: NextRequest): boolean {
  const key = process.env.AGENT_API_KEY
  if (!key) return true
  return req.headers.get('authorization') === `Bearer ${key}`
}

/**
 * POST /api/deploy
 * Auth: Bearer {AGENT_API_KEY}
 *
 * Triggers a Vercel deployment by committing a timestamp file to GitHub
 * WITHOUT the [skip vercel] tag. Use this after a bulk Chrome extension
 * import session to kick off a fresh build.
 *
 * Body (all optional):
 * { message?: string }
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch {}

  const ts = new Date().toISOString()
  const commitMessage = body.message
    ? `deploy: ${body.message}`
    : `deploy: trigger build at ${ts}`

  // Write a tiny deploy-log file so the commit has a real diff
  const filePath = '.deploy-log'
  const content = `${ts}\n`

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
    return NextResponse.json({ error: err.message || 'GitHub push failed' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({
    success: true,
    commitSha: data.commit?.sha,
    message: commitMessage,
    deployUrl: `https://kb.insightprofit.live`,
  })
}
