import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase'

// POST { sessionId, title?, brand? }
// Bundles the entire Chief of Staff conversation into a single knowledge_items
// row so it shows up in normal KB search, vector embedding pipeline, etc.
// Idempotent: re-running updates the existing note (one note per conversation).

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'service role not configured' }, { status: 503 })
  }
  let body: { sessionId?: string; title?: string; brand?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const { sessionId, title: titleOverride, brand = 'shared' } = body
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  // Resolve conversation
  const { data: conv, error: convErr } = await supabaseAdmin
    .from('cos_conversations')
    .select('id, title, summary, saved_as_kb_item_id, started_at, last_message_at')
    .eq('session_id', sessionId)
    .maybeSingle()
  if (convErr || !conv) {
    return NextResponse.json({ error: 'conversation not found' }, { status: 404 })
  }

  // Pull messages in order
  const { data: msgs, error: msgsErr } = await supabaseAdmin
    .from('cos_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
  if (msgsErr) {
    return NextResponse.json({ error: msgsErr.message }, { status: 500 })
  }
  const messages = msgs || []
  if (messages.length === 0) {
    return NextResponse.json({ error: 'no messages to save' }, { status: 400 })
  }

  const finalTitle = (titleOverride || conv.title || 'Chief of Staff chat').slice(0, 200)
  const transcript = messages
    .map(m => `### ${m.role === 'user' ? '🧑 You' : '🤖 Chief of Staff'}\n\n${m.content}`)
    .join('\n\n---\n\n')
  const header = `# ${finalTitle}\n\n_Captured from Chief of Staff on ${new Date().toISOString().slice(0,10)}._\n\n`
  const content = header + transcript
  const plain = messages.map(m => m.content).join('\n\n')
  const word_count = plain.split(/\s+/).filter(Boolean).length

  const row = {
    user_id: '893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0',
    title: finalTitle,
    content: content.slice(0, 100000),
    content_plain: plain.slice(0, 100000),
    item_type: 'chief-of-staff-chat',
    brand,
    tags: ['chief-of-staff', 'chat', `session:${sessionId}`],
    summary: (conv.summary || plain).slice(0, 200),
    word_count,
    status: 'active',
  }

  let kbItemId = conv.saved_as_kb_item_id as string | null
  if (kbItemId) {
    const { error } = await supabaseAdmin.from('knowledge_items').update(row).eq('id', kbItemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert(row)
      .select('id')
      .single()
    if (error || !created) {
      return NextResponse.json({ error: error?.message || 'insert failed' }, { status: 500 })
    }
    kbItemId = created.id
    await supabaseAdmin
      .from('cos_conversations')
      .update({ saved_as_kb_item_id: kbItemId })
      .eq('id', conv.id)
  }

  return NextResponse.json({ ok: true, kbItemId, conversationId: conv.id })
}
