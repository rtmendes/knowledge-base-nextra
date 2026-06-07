import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

// POST { sessionId, messageContent, title?, listId?, priority? }
// Turns a Chief of Staff reply into a ClickUp task.
// Auth: uses CLICKUP_API_KEY from env (server-only).
//
// List routing follows Viktor's pattern (see docs/SUPABASE-SCHEMA.md →
// public.clickup_sync). Chief of Staff replies are "strategic captures from
// chat" — they default to the Digest Items list, then escalate by keyword:
//   blocked/broken/failing/urgent      → ⏸️ Blocked (Needs Rashida)
//   fix today / asap / do now          → 🔴 Needs Action (Dispatch)
//   build / ship / PRD / spec / design → 📋 PRD Needed
//   else                               → 📋 Digest Items   (default)
// Every list ID is env-overridable so you can re-route without a deploy.

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY

const LISTS = {
  blocked:    process.env.CLICKUP_BLOCKED_LIST_ID    || '901712867639', // ⏸️ Blocked (Needs Rashida)
  dispatch:   process.env.CLICKUP_DISPATCH_LIST_ID   || '901712900200', // 🔴 Needs Action
  prd:        process.env.CLICKUP_PRD_LIST_ID        || '901712867636', // 📋 PRD Needed
  digest:     process.env.CLICKUP_DIGEST_LIST_ID     || '901713359622', // 📋 Digest Items
}
// Explicit Chief-of-Staff override, if you want one list to catch everything
const FORCE_LIST_ID = process.env.CLICKUP_KB_TASK_LIST_ID

const RX_BLOCKED  = /\b(blocked?|broken|failing|crashing|urgent|critical|down|outage)\b/i
const RX_DISPATCH = /\b(fix today|do now|right now|asap|immediately|today\b|emergency)\b/i
const RX_PRD      = /\b(build|ship|prd|spec(?:ification)?|design doc|feature|roadmap|plan to)\b/i

function routeList(content: string, override?: string): { listId: string; bucket: string } {
  if (override) return { listId: override, bucket: 'override' }
  if (FORCE_LIST_ID) return { listId: FORCE_LIST_ID, bucket: 'forced' }
  if (RX_BLOCKED.test(content))  return { listId: LISTS.blocked,  bucket: 'blocked' }
  if (RX_DISPATCH.test(content)) return { listId: LISTS.dispatch, bucket: 'dispatch' }
  if (RX_PRD.test(content))      return { listId: LISTS.prd,      bucket: 'prd' }
  return { listId: LISTS.digest, bucket: 'digest' }
}

export async function POST(req: NextRequest) {
  if (!CLICKUP_API_KEY) {
    return NextResponse.json({
      error: 'CLICKUP_API_KEY not configured in this environment',
      hint: 'Add CLICKUP_API_KEY to .env.local (and Vercel env) to enable task creation',
    }, { status: 503 })
  }

  let body: { sessionId?: string; messageContent?: string; title?: string; listId?: string; priority?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const { sessionId, messageContent, title: titleOverride, listId: listOverride, priority = 3 } = body
  if (!messageContent || messageContent.trim().length < 5) {
    return NextResponse.json({ error: 'messageContent required (>=5 chars)' }, { status: 400 })
  }

  const { listId, bucket } = routeList(messageContent, listOverride)

  // Derive title (truncate, strip markdown)
  const stripped = messageContent.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim()
  const title = (titleOverride || stripped).slice(0, 100).replace(/\s+\S*$/, '')

  const description =
    `## From Chief of Staff\n\n${messageContent}\n\n` +
    (sessionId ? `## Source\nChief of Staff session: \`${sessionId}\`\n\n` : '') +
    `*Created via Chief of Staff "Make this a task" on ${new Date().toISOString()} — routed: ${bucket}*`

  try {
    const res = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
      method: 'POST',
      headers: {
        Authorization: CLICKUP_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `💡 ${title}`,
        description,
        priority: bucket === 'blocked' ? 1 : bucket === 'dispatch' ? 2 : priority,
        tags: ['chief-of-staff', 'kb-suggested', `route:${bucket}`],
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `ClickUp ${res.status}: ${text}` }, { status: 502 })
    }
    const task = await res.json() as { id: string; url: string }

    // Best-effort: link the task back to the conversation
    if (sessionId && supabaseAdmin) {
      try {
        const { data: conv } = await supabaseAdmin
          .from('cos_conversations')
          .select('id, metadata')
          .eq('session_id', sessionId)
          .maybeSingle()
        if (conv) {
          const meta = (conv.metadata as Record<string, unknown>) || {}
          const tasks = Array.isArray(meta.clickup_task_ids) ? meta.clickup_task_ids : []
          await supabaseAdmin
            .from('cos_conversations')
            .update({ metadata: { ...meta, clickup_task_ids: [...tasks, task.id] } })
            .eq('id', conv.id)
        }
      } catch (err) {
        console.error('[create-task] metadata link failed:', err)
      }
    }

    return NextResponse.json({ ok: true, taskId: task.id, taskUrl: task.url, listId, routedAs: bucket })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'ClickUp request failed',
    }, { status: 502 })
  }
}
