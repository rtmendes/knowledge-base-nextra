import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getItemById, getCategoryBySlug, getItemTypeConfig } from '../../../../lib/supabase-kb'
import { ItemTypeBadge } from '../../../../components/kb/ItemTypeBadge'
import { KBContentRenderer } from '../../../../components/kb/KBContentRenderer'
import { supabaseAdmin } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Icon map
const ICON_MAP: Record<string, string> = {
  'fas fa-robot': '🤖', 'fas fa-cogs': '⚙️', 'fas fa-plane': '✈️',
  'fas fa-gem': '💎', 'fas fa-chart-line': '📈', 'fas fa-bullhorn': '📢',
  'fas fa-graduation-cap': '🎓', 'fas fa-pray': '🙏', 'fas fa-heartbeat': '💪',
  'fas fa-utensils': '🍽️', 'fas fa-folder': '📁', 'fas fa-book': '📚',
  'fas fa-star': '⭐', 'fas fa-music': '🎵', 'fas fa-newspaper': '📰',
  'fas fa-users': '👨‍👩‍👧‍👦', 'fas fa-dollar-sign': '💰', 'fas fa-store': '🏪',
  'fas fa-home': '🏠', 'fas fa-flask': '🔬', 'fas fa-search': '🔍',
  'fas fa-code': '💻', 'fas fa-server': '🖥️', 'fas fa-video': '🎬',
  'fas fa-heart': '❤️', 'fas fa-play-circle': '▶️',
}

interface Props {
  params: Promise<{ id: string }>
}

async function getCategoryById(id: string) {
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('kb_categories')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const item = await getItemById(id)
  if (!item) return { title: 'Item Not Found' }
  return {
    title: `${item.title} — Knowledge Base — InsightProfit`,
    description: item.summary || `${item.title} — ${item.item_type} knowledge item`,
  }
}

async function ItemContent({ params }: Props) {
  const { id } = await params
  const item = await getItemById(id)
  if (!item) notFound()

  const category = item.category_id ? await getCategoryById(item.category_id) : null
  const config = getItemTypeConfig(item.item_type)
  const catIcon = category ? (ICON_MAP[category.icon] || '📄') : '📄'
  const tags = item.tags || []
  const hasHtml = item.content && (item.content.includes('<') || item.content.includes('&lt;'))
  const hasMarkdown = item.content && !hasHtml

  // Extract source URL from metadata
  const sourceUrl = (item as any).source_url || item.metadata?.source_url || item.metadata?.url || item.metadata?.genspark_url || null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-xs flex-wrap">
        <Link href="/" className="text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors">Home</Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Link href="/kb" className="text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors">Knowledge Base</Link>
        {category && (
          <>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link href={`/kb/${category.slug}`} className="text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors">
              {catIcon} {category.name}
            </Link>
          </>
        )}
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{item.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
          {item.title}
        </h1>

        {/* Summary */}
        {item.summary && (
          <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            {item.summary}
          </p>
        )}

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <ItemTypeBadge type={item.item_type} size="md" />
          
          {category && (
            <Link 
              href={`/kb/${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
            >
              <span>{catIcon}</span>
              <span>{category.name}</span>
            </Link>
          )}

          {item.status && item.status !== 'active' && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              item.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {item.status === 'draft' ? '📝 Draft' : '📦 Archived'}
            </span>
          )}

          {item.word_count > 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400">
              {item.word_count.toLocaleString()} words
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Use cases */}
      {item.use_cases && item.use_cases.length > 0 && (
        <div className="mb-8 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-5">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">💡 Use Cases</h3>
          <ul className="space-y-1">
            {item.use_cases.map((uc: string, i: number) => (
              <li key={i} className="text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                {uc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bound brands / features / publications */}
      {((item.bound_brands?.length > 0) || (item.bound_features?.length > 0) || (item.bound_publications?.length > 0)) && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {item.bound_brands?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">🏢 Brands</h4>
              <div className="flex flex-wrap gap-1">
                {item.bound_brands.map((b: string) => (
                  <span key={b} className="inline-flex rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{b}</span>
                ))}
              </div>
            </div>
          )}
          {item.bound_features?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">✨ Features</h4>
              <div className="flex flex-wrap gap-1">
                {item.bound_features.map((f: string) => (
                  <span key={f} className="inline-flex rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{f}</span>
                ))}
              </div>
            </div>
          )}
          {item.bound_publications?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">📰 Publications</h4>
              <div className="flex flex-wrap gap-1">
                {item.bound_publications.map((p: string) => (
                  <span key={p} className="inline-flex rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {item.content ? (
        <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-img:rounded-xl prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700">
          <KBContentRenderer content={item.content} isHtml={!!hasHtml} />
        </article>
      ) : item.content_plain ? (
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-7">
            {item.content_plain}
          </div>
        </article>
      ) : (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This item doesn't have content yet.
            {sourceUrl && (
              <> View the <a href={sourceUrl} className="text-amber-600 dark:text-amber-400 underline" target="_blank" rel="noopener noreferrer">original source</a>.</>
            )}
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          {/* WYSIWYG edit link */}
          <a
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.insightprofit.live'}/project/default/editor?table=knowledge_items&id=${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            ✏️ Edit in Supabase
          </a>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              🔗 View Original Source
            </a>
          )}

          <Link
            href={`/kb/${category?.slug || ''}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            ← Back to {category?.name || 'Category'}
          </Link>
        </div>
      </div>

      {/* Metadata debug section (collapsed by default) */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <details className="mt-6">
          <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400">
            View item metadata
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 dark:text-gray-400 overflow-x-auto border border-gray-200 dark:border-gray-700">
            {JSON.stringify(item.metadata, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

export default function ItemPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
        <div className="h-10 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    }>
      <ItemContent {...props} />
    </Suspense>
  )
}
