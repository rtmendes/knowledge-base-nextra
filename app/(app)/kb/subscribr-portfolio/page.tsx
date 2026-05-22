import Link from 'next/link'
import { Suspense } from 'react'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Subscribr Portfolio — Knowledge Base — InsightProfit',
  description: 'Browse 505 Subscribr items: 255 YouTube channel profiles, 234 AI chat transcripts, scripts, audience research, and competitor analysis.',
}

async function getSubscribrData() {
  if (!supabaseAdmin) return { channels: [], chats: [], collections: [], stats: { total: 0, channels: 0, chats: 0, collections: 0 } }

  const catId = '079e6be9-8276-4bd2-bdd8-a5dd2d46330c'

  // Fetch all items in one call (505 items)
  const { data: allItems } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, slug, item_type, word_count, summary, tags, metadata, updated_at')
    .eq('category_id', catId)
    .eq('status', 'active')
    .order('word_count', { ascending: false })
    .limit(600)

  const items = allItems || []

  const channels = items.filter(i =>
    i.item_type === 'reference' && (i.title?.includes('Channel Profile') || i.metadata?.source === 'subscribr_api')
  ).sort((a, b) => {
    const subA = a.metadata?.subscribers || 0
    const subB = b.metadata?.subscribers || 0
    return subB - subA
  })

  const chats = items.filter(i => i.item_type === 'chat_transcript')
  const collections = items.filter(i =>
    i.item_type === 'reference' && !i.title?.includes('Channel Profile') && !(i.metadata?.source === 'subscribr_api')
  )

  return {
    channels,
    chats,
    collections,
    stats: { total: items.length, channels: channels.length, chats: chats.length, collections: collections.length },
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

async function SubscribrContent() {
  const { channels, chats, collections, stats } = await getSubscribrData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="pt-8 pb-6 sm:pt-12 sm:pb-8">
        <nav className="flex items-center gap-2 mb-6 text-xs text-gray-400 dark:text-gray-500">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>›</span>
          <Link href="/kb" className="hover:text-amber-500 transition-colors">Knowledge Base</Link>
          <span>›</span>
          <Link href="/kb/subscribr" className="hover:text-amber-500 transition-colors">Subscribr</Link>
          <span>›</span>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Portfolio</span>
        </nav>

        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            📺
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-2">
              Subscribr Portfolio
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl">
              YouTube channel intelligence, AI chat transcripts, audience research, scripts, and competitor analysis — all searchable and editable.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Items', value: stats.total, color: 'bg-red-500' },
            { label: 'Channel Profiles', value: stats.channels, color: 'bg-blue-500' },
            { label: 'Chat Transcripts', value: stats.chats, color: 'bg-green-500' },
            { label: 'Collections', value: stats.collections, color: 'bg-amber-500' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{s.value}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/kb/subscribr" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
            📺 Browse All Subscribr Items
          </Link>
          <Link href="/kb/subscribr?type=chat_transcript" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
            💬 All Chats
          </Link>
          <Link href="/kb/subscribr?type=reference" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
            📊 All Channel Profiles
          </Link>
        </div>
      </div>

      {/* ── Channel Profiles Grid ──────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <span className="text-red-500">▶</span> Channel Profiles
            <span className="text-sm font-normal text-gray-400">({channels.length})</span>
          </h2>
          <Link href="/kb/subscribr?type=reference" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.slice(0, 30).map(ch => {
            const subs = ch.metadata?.subscribers
            const videos = ch.metadata?.video_count
            const hasVoice = ch.metadata?.has_voice_tone
            const channelName = ch.title?.replace('Channel Profile: ', '').replace(' — Subscribr Intelligence', '')

            return (
              <Link
                key={ch.id}
                href={`/kb/item/${ch.id}`}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                    {channelName}
                  </h3>
                  {hasVoice && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 flex-shrink-0 ml-2">
                      🎙️ Voice
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {subs && <span>👥 {formatNumber(subs)}</span>}
                  {videos && <span>🎬 {videos} videos</span>}
                  <span>📝 {(ch.word_count || 0).toLocaleString()} words</span>
                </div>
                {ch.summary && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{ch.summary}</p>
                )}
              </Link>
            )
          })}
        </div>

        {channels.length > 30 && (
          <div className="mt-4 text-center">
            <Link href="/kb/subscribr?type=reference" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
              View all {channels.length} channel profiles →
            </Link>
          </div>
        )}
      </section>

      {/* ── Chat Transcripts ───────────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            <span className="text-green-500">💬</span> Chat Transcripts
            <span className="text-sm font-normal text-gray-400">({chats.length})</span>
          </h2>
          <Link href="/kb/subscribr?type=chat_transcript" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {chats.slice(0, 30).map(chat => {
            const chatTitle = chat.title?.replace('Chat: ', '')
            const msgCount = chat.metadata?.message_count || 0

            return (
              <Link
                key={chat.id}
                href={`/kb/item/${chat.id}`}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2 mb-2">
                  {chatTitle}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>💬 {msgCount} msgs</span>
                  <span>📝 {(chat.word_count || 0).toLocaleString()} words</span>
                </div>
                {chat.summary && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 line-clamp-2">{chat.summary}</p>
                )}
              </Link>
            )
          })}
        </div>

        {chats.length > 30 && (
          <div className="mt-4 text-center">
            <Link href="/kb/subscribr?type=chat_transcript" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
              View all {chats.length} chat transcripts →
            </Link>
          </div>
        )}
      </section>

      {/* ── Collections & References ───────────────────────────── */}
      {collections.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2 mb-4">
            <span className="text-amber-500">📦</span> Collections & References
            <span className="text-sm font-normal text-gray-400">({collections.length})</span>
          </h2>
          <div className="space-y-2">
            {collections.map(col => (
              <Link
                key={col.id}
                href={`/kb/item/${col.id}`}
                className="group flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 px-5 py-3 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {col.title}
                  </h3>
                  {col.summary && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{col.summary}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{(col.word_count || 0).toLocaleString()} words</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Integration Info ───────────────────────────────────── */}
      <section className="mb-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-3">⚡ Integration Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Data Sources</h3>
            <ul className="space-y-1 text-xs">
              <li>• Subscribr API — channels, scripts, ideas, competitors</li>
              <li>• Browser extraction — 234 chat transcripts with full HTML</li>
              <li>• Google Sheets cross-reference — 255 channels synced</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Capabilities</h3>
            <ul className="space-y-1 text-xs">
              <li>• ✏️ All content is editable inline</li>
              <li>• 🔍 Semantic search across all items</li>
              <li>• 📥 Download as PDF, HTML, or Markdown</li>
              <li>• 🔄 Daily sync cron updates channels & scripts</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SubscribrPortfolioPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
      </div>
    }>
      <SubscribrContent />
    </Suspense>
  )
}
