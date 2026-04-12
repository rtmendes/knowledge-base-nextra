import { NextResponse } from 'next/server'
// Health check — also confirms env vars are loaded
export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    hasGithubToken: !!process.env.GITHUB_TOKEN,
  })
}
