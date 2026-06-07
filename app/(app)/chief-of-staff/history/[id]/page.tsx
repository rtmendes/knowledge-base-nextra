import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '../../../../../lib/supabase'

// Server-rendered transcript view for a single Chief of Staff conversation.

export const dynamic = 'force-dynamic'

interface Conversation {
  id: string
  session_id: string
  title: string | null
  summary: string | null
  message_count: number
  pinned: boolean
  saved_as_kb_item_id: string | null
  started_at: string
  last_message_at: string
  metadata: Record<string, unknown> | null
}

interface Message {
  id: number
  role: string
  content: string
  sources: Array<{ id?: string; title?: string; item_type?: string; url?: string; external?: boolean }> | null
  matched_entities: unknown[] | null
  created_at: string
}

async function loadConversation(id: string): Promise<{ conv: Conversation; messages: Message[] } | null> {
  if (!supabaseAdmin) return null
  const { data: conv } = await supabaseAdmin
    .from('cos_conversations')
    .select('id, session_id, title, summary, message_count, pinned, saved_as_kb_item_id, started_at, last_message_at, metadata')
    .eq('id', id)
    .maybeSingle()
  if (!conv) return null
  const { data: msgs } = await supabaseAdmin
    .from('cos_messages')
    .select('id, role, content, sources, matched_entities, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
  return { conv: conv as Conversation, messages: (msgs || []) as Message[] }
}

export default async function ConversationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await loadConversation(id)
  if (!data) notFound()
  const { conv, messages } = data

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', color: '#f8fafc' }}>
      <Link href="/chief-of-staff/history" style={{ color: '#a78bfa', fontSize: 12, textDecoration: 'none' }}>
        ← All chats
      </Link>

      <header style={{ marginTop: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #2d2d3a' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 8 }}>
          {conv.pinned && <span style={{ marginRight: 8 }}>📌</span>}
          {conv.title || 'Untitled conversation'}
        </h1>
        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>💬 {conv.message_count} messages</span>
          <span>📅 Started {new Date(conv.started_at).toISOString().slice(0, 10)}</span>
          {conv.saved_as_kb_item_id && (
            <Link href={`/kb/item/${conv.saved_as_kb_item_id}`} style={{ color: '#34d399', textDecoration: 'underline' }}>
              💾 Saved as KB note
            </Link>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.map(m => (
          <div key={m.id} style={{
            padding: 16, borderRadius: 12,
            background: m.role === 'user' ? '#1f1f2e' : '#15151f',
            border: `1px solid ${m.role === 'user' ? '#3b3b52' : '#2d2d3a'}`,
          }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase',
              letterSpacing: '0.05em', fontWeight: 600, marginBottom: 8 }}>
              {m.role === 'user' ? '🧑 You' : '🤖 Chief of Staff'}
              <span style={{ marginLeft: 12, color: '#6b7280', textTransform: 'none', fontWeight: 400 }}>
                {new Date(m.created_at).toISOString().slice(11, 16)} UTC
              </span>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#f8fafc' }}>
              {m.content}
            </div>
            {m.sources && m.sources.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2d2d3a',
                display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {m.sources.map((s, si) => (
                  <a key={si} href={s.url || '#'}
                    target={s.external || s.url?.startsWith('http') ? '_blank' : undefined}
                    rel={s.external || s.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{
                      fontSize: 11, padding: '3px 8px', borderRadius: 4,
                      background: '#2d2d3a', color: '#a78bfa',
                      textDecoration: 'none', border: '1px solid #3b3b52',
                    }}>
                    {s.title || s.id || 'source'}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
          No messages yet in this conversation.
        </div>
      )}
    </main>
  )
}
