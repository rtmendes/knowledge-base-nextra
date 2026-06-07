import Link from 'next/link'
import { supabaseAdmin } from '../../../../lib/supabase'

// Server component — list past Chief of Staff conversations.
// Search uses the tsvector `search_doc` column populated by trigger.

interface ConversationRow {
  id: string
  session_id: string
  title: string | null
  summary: string | null
  message_count: number
  pinned: boolean
  archived: boolean
  saved_as_kb_item_id: string | null
  started_at: string
  last_message_at: string
}

export const dynamic = 'force-dynamic'

async function loadConversations(q: string): Promise<ConversationRow[]> {
  if (!supabaseAdmin) return []
  let query = supabaseAdmin
    .from('cos_conversations')
    .select('id, session_id, title, summary, message_count, pinned, archived, saved_as_kb_item_id, started_at, last_message_at')
    .eq('archived', false)
    .order('pinned', { ascending: false })
    .order('last_message_at', { ascending: false })
    .limit(200)
  if (q.trim()) {
    // FTS search — server-generated tsvector handles stemming
    query = query.textSearch('search_doc', q, { type: 'websearch', config: 'english' })
  }
  const { data, error } = await query
  if (error) {
    console.error('[cos history] load failed:', error)
    return []
  }
  return (data || []) as ConversationRow[]
}

function fmt(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = diffMs / 3_600_000
    if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60_000))}m ago`
    if (diffH < 24) return `${Math.floor(diffH)}h ago`
    if (diffH < 24 * 7) return `${Math.floor(diffH / 24)}d ago`
    return d.toISOString().slice(0, 10)
  } catch { return iso }
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const rows = await loadConversations(q)

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px', color: '#f8fafc' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ color: '#a78bfa', fontSize: 12, textDecoration: 'none' }}>← Back to KB</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 8, marginBottom: 6 }}>
          🤖 Chief of Staff — Chat History
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>
          Every Chief of Staff conversation, searchable. Click any chat to view the full transcript, save it as a KB note, or turn it into actionable tasks.
        </p>
      </div>

      <form method="GET" style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search past conversations…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8,
            background: '#1a1a24', border: '1px solid #2d2d3a', color: '#f8fafc',
            fontSize: 14, outline: 'none',
          }}
        />
        <button type="submit" style={{
          padding: '10px 18px', borderRadius: 8, background: '#6366f1',
          color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>Search</button>
        {q && (
          <Link href="/chief-of-staff/history" style={{
            padding: '10px 18px', borderRadius: 8, background: '#2d2d3a',
            color: '#f8fafc', border: 'none', fontWeight: 600, fontSize: 13,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>Clear</Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center', borderRadius: 12,
          background: '#1a1a24', border: '1px solid #2d2d3a', color: '#9ca3af',
        }}>
          {q
            ? <>No conversations match <strong>"{q}"</strong>. <Link href="/chief-of-staff/history" style={{ color: '#a78bfa' }}>Clear search</Link>.</>
            : <>No chats yet. Open Chief of Staff and ask something — every chat lands here automatically.</>}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <li key={r.id}>
              <Link
                href={`/chief-of-staff/history/${r.id}`}
                style={{
                  display: 'block', padding: 16, borderRadius: 12,
                  background: '#1a1a24', border: '1px solid #2d2d3a',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'border-color 0.15s ease',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                  <strong style={{ fontSize: 15, color: '#f8fafc' }}>
                    {r.pinned && <span title="Pinned" style={{ marginRight: 6 }}>📌</span>}
                    {r.title || 'Untitled conversation'}
                  </strong>
                  <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {fmt(r.last_message_at)}
                  </span>
                </div>
                {r.summary && (
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {r.summary}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 11, color: '#6b7280' }}>
                  <span>💬 {r.message_count} message{r.message_count === 1 ? '' : 's'}</span>
                  {r.saved_as_kb_item_id && <span>💾 saved as KB note</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
