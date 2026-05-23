import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  getItemById,
  getItemChildren,
  getItemSiblings,
  getItemParent,
  getItemTypeConfig,
  getCategoryIcon,
} from '../../../../../lib/supabase-kb'
import { ItemTypeBadge } from '../../../../../components/kb/ItemTypeBadge'
import { KBContentSection } from '../../../../../components/kb/KBContentSection'
import { ShareDownloadBar } from '../../../../../components/kb/ShareDownloadBar'
import { ItemPageToC } from '../../../../../components/kb/ItemPageToC'
import { ItemDatabasesSection } from '../../../../../components/kb/database/ItemDatabasesSection'
import { supabaseAdmin } from '../../../../../lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // Fetch related data in parallel
  const [category, children, parent] = await Promise.all([
    item.category_id ? getCategoryById(item.category_id) : Promise.resolve(null),
    getItemChildren(item.id),
    item.parent_id ? getItemParent(item.parent_id) : Promise.resolve(null),
  ])

  // Fetch siblings only if item has a parent (avoid extra query otherwise)
  const siblings = (item.parent_id && parent)
    ? await getItemSiblings(item.parent_id, item.id)
    : []

  const catIcon = category ? getCategoryIcon(category.icon) : '📄'
  const tags = item.tags || []
  const sourceUrl = (item as any).source_url || item.metadata?.source_url || item.metadata?.url || item.metadata?.genspark_url || null

  // Group children by type for the project overview panel
  const childrenByType: Record<string, typeof children> = {}
  for (const c of children) {
    if (!childrenByType[c.item_type]) childrenByType[c.item_type] = []
    childrenByType[c.item_type].push(c)
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 kb-page-wrapper">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 pt-8 mb-8 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href="/kb" className="hover:text-amber-500 transition-colors">Knowledge Base</Link>
        {category && (
          <>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href={`/kb/${category.slug}`} className="hover:text-amber-500 transition-colors">
              {catIcon} {category.name}
            </Link>
          </>
        )}
        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[250px]">{item.title}</span>
      </nav>

      {/* ── Part of Project banner ──────────────────────────────── */}
      {parent && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-500 text-base flex-shrink-0">📁</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0">Part of project:</span>
            <Link
              href={`/kb/project/${parent.id}`}
              className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors truncate"
            >
              {parent.title}
            </Link>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {siblings.length > 0 && (
              <span className="text-xs text-amber-600/70 dark:text-amber-500/70 hidden sm:inline">
                {siblings.length} related item{siblings.length !== 1 ? 's' : ''}
              </span>
            )}
            <Link
              href={`/kb/project/${parent.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ── Article Header ──────────────────────────────────────── */}
      <header className="mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight kb-item-title">
          {item.title}
        </h1>

        {/* Summary */}
        {item.summary && (
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-6 max-w-3xl">
            {item.summary}
          </p>
        )}

        {/* Meta pills */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <ItemTypeBadge type={item.item_type} size="md" />

          {category && (
            <Link
              href={`/kb/${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
            >
              <span>{catIcon}</span>
              <span>{category.name}</span>
            </Link>
          )}

          {item.status && item.status !== 'active' && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              item.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}>
              {item.status === 'draft' ? '📝 Draft' : '📦 Archived'}
            </span>
          )}

          {item.word_count > 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {item.word_count.toLocaleString()} words
            </span>
          )}

          {formatDate(item.updated_at || item.created_at) && (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              {formatDate(item.updated_at || item.created_at)}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Share & Download */}
        <div className="pt-2">
          <ShareDownloadBar
            itemId={item.id}
            title={item.title}
            content={item.content || item.content_plain || ''}
            itemType={item.item_type}
          />
        </div>
      </header>

      {/* ── Use Cases ───────────────────────────────────────────── */}
      {item.use_cases && item.use_cases.length > 0 && (
        <div className="mb-8 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-5">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-1.5">
            <span>💡</span>
            <span>Use Cases</span>
          </h3>
          <ul className="space-y-1.5">
            {item.use_cases.map((uc: string, i: number) => (
              <li key={i} className="text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
                <span className="text-emerald-400 dark:text-emerald-600 mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">{uc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Bound Entities ──────────────────────────────────────── */}
      {((item.bound_brands?.length > 0) || (item.bound_features?.length > 0) || (item.bound_publications?.length > 0)) && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {item.bound_brands?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>🏢</span> Brands
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.bound_brands.map((b: string) => (
                  <span key={b} className="inline-flex rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{b}</span>
                ))}
              </div>
            </div>
          )}
          {item.bound_features?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>✨</span> Features
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.bound_features.map((f: string) => (
                  <span key={f} className="inline-flex rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{f}</span>
                ))}
              </div>
            </div>
          )}
          {item.bound_publications?.length > 0 && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>📰</span> Publications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {item.bound_publications.map((p: string) => (
                  <span key={p} className="inline-flex rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Content (with WYSIWYG editor) ───────────────────────── */}
      <article className="pb-8">
        <KBContentSection
          itemId={item.id}
          content={item.content || item.content_plain || ''}
          itemType={item.item_type}
          metadata={item.metadata || null}
        />

        {/* ── Inline Databases (Notion-like) ──────────────────────── */}
        <ItemDatabasesSection itemId={item.id} />
      </article>

      {/* ── Project Contents (if this item is a parent) ─────────── */}
      {children.length > 0 && (
        <div className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Project Contents
              </h2>
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                {children.length}
              </span>
            </div>
            <Link
              href={`/kb/project/${item.id}`}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              View full project
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {Object.entries(childrenByType).map(([type, items]) => {
              const config = getItemTypeConfig(type)
              return items.map(child => (
                <Link
                  key={child.id}
                  href={`/kb/item/${child.id}`}
                  className="group flex items-center gap-3 px-5 py-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate block">
                      {child.title}
                    </span>
                    {child.word_count > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        {child.word_count.toLocaleString()} words
                      </span>
                    )}
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${config.bgColor} ${config.color}`}>
                    {config.label}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))
            })}
          </div>
        </div>
      )}

      {/* ── Sibling Items ────────────────────────────────────────── */}
      {siblings.length > 0 && (
        <div className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🔗</span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Other Items in This Project
              </h2>
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                {siblings.length}
              </span>
            </div>
            {parent && (
              <Link
                href={`/kb/project/${parent.id}`}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                View project
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto">
            {siblings.slice(0, 30).map(sibling => {
              const config = getItemTypeConfig(sibling.item_type)
              return (
                <Link
                  key={sibling.id}
                  href={`/kb/item/${sibling.id}`}
                  className="group flex items-center gap-3 px-5 py-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors"
                >
                  <span className="text-base flex-shrink-0">{config.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate block">
                      {sibling.title}
                    </span>
                    {sibling.word_count > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        {sibling.word_count.toLocaleString()} words
                      </span>
                    )}
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${config.bgColor} ${config.color}`}>
                    {config.label}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6 pb-12">
        <div className="flex flex-wrap items-center gap-4">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Original Source
            </a>
          )}

          <Link
            href={`/kb/${category?.slug || ''}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {category?.name || 'Category'}
          </Link>
        </div>
      </div>

      {/* ── Metadata (collapsible) ──────────────────────────────── */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <details className="mb-8">
          <summary className="text-xs text-gray-400 dark:text-gray-600 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400 transition-colors select-none">
            View item metadata
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs text-gray-500 dark:text-gray-400 overflow-x-auto border border-gray-200 dark:border-gray-800 leading-relaxed">
            {JSON.stringify(item.metadata, null, 2)}
          </pre>
        </details>
      )}

      {/* ── Right panel ToC — pass empty string; component reads headings from rendered DOM */}
      <ItemPageToC content="" />
    </div>
  )
}

export default function ItemPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded mb-8 animate-pulse" />
        {/* Title skeleton */}
        <div className="h-10 w-[70%] bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse" />
        <div className="h-5 w-[90%] bg-gray-100 dark:bg-gray-800 rounded mb-6 animate-pulse" />
        {/* Meta pills skeleton */}
        <div className="flex gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="h-7 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="h-7 w-16 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
        </div>
        {/* Content skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${55 + Math.random() * 45}%` }} />
          ))}
        </div>
      </div>
    }>
      <ItemContent {...props} />
    </Suspense>
  )
}
