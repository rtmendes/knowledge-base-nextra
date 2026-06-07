import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

// POST { sessionId, messageContent, title?, listId?, priority? }
// Turns a Chief of Staff reply into a ClickUp task.
// Auth: uses CLICKUP_API_KEY from env (server-only).
// List: falls back to CLICKUP_KB_TASK_LIST_ID, then CLICKUP_BLOCKED_LIST_ID.

const CLICKUP_API_KEY        = process.env.CLICKUP_API_KEY
const DEFAULT_LIST_ID        = process.env.CLICKUP_KB_TASK_LIST_ID || process.env.CLICKUP_BLOCKED_LIST_ID || '901712867639'

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

  const listId = listOverride || DEFAULT_LIST_ID

  // Derive title (truncate, strip markdown)
  const stripped = messageContent.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim()
  const title = (titleOverride || stripped).slice(0, 100).replace(/\s+\S*$/, '')

  const description =
    `## From Chief of Staff\n\n${messageContent}\n\n` +
    (sessionId ? `## Source\nChief of Staff session: \`${sessionId}\`\n\n` : '') +
    `*Created via Chief of Staff "Make this a task" on ${new Date().toISOString()}*`

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
        priority,
        tags: ['chief-of-staff', 'kb-suggested'],
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

    return NextResponse.json({ ok: true, taskId: task.id, taskUrl: task.url })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'ClickUp request failed',
    }, { status: 502 })
  }
}
