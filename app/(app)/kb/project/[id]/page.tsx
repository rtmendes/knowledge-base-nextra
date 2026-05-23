import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import {
  getItemById,
  getItemChildren,
  getItemTypeConfig,
  getCategoryIcon,
} from '../../../../../lib/supabase-kb'
import { ItemTypeBadge } from '../../../../../components/kb/ItemTypeBadge'
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
  if (!item) return { title: 'Project Not Found' }
  return {
    title: `${item.title} — Project — Knowledge Base`,
    description: item.summary || `Project overview for ${item.title}`,
  }
}

// Type order for rendering child groups — most meaningful first
const TYPE_ORDER = [
  'manus_doc',
  'manus_output',
  'manus_task',
  'manus_file',
  'sop',
  'department_sop',
  'prd',
  'chatgpt_chat',
  'genspark_chat',
  'agent',
  'agent_workflow',
  'inspiration',
  'spreadsheet',
]

async function ProjectContent({ params }: Props) {
  const { id } = await params

  const [parent, children] = await Promise.all([
    getItemById(id),
    getItemChildren(id),
  ])

  if (!parent) notFound()

  const category = parent.category_id ? await getCategoryById(parent.category_id) : null
  const catIcon = category ? getCategoryIcon(category.icon) : '📁'

  // Group children by item_type
  const grouped: Record<string, typeof children> = {}
  for (const child of children) {
    if (!grouped[child.item_type]) grouped[child.item_type] = []
    grouped[child.item_type].push(child)
  }

  const sortedTypes = [
    ...TYPE_ORDER.filter(t => grouped[t]),
    ...Object.keys(grouped).filter(t => !TYPE_ORDER.includes(t)).sort(),
  ]

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 mb-8 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/kb" className="hover:text-amber-500 transition-colors">Knowledge Base</Link>
        {category && (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/kb/${category.slug}`} className="hover:text-amber-500 transition-colors">
              {catIcon} {category.name}
            </Link>
          </>
        )}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[280px]">
          {parent.title}
        </span>
      </nav>

      {/* ── Project Header ── */}
      <header className="mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
            📁 Project
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-4 leading-tight">
          {parent.title}
        </h1>
        {parent.summary && (
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl text-base mb-5">
            {parent.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <ItemTypeBadge type={parent.item_type} size="md" />

          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
            {children.length} item{children.length !== 1 ? 's' : ''}
          </span>

          {sortedTypes.length > 1 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              {sortedTypes.length} types
            </span>
          )}

          {formatDate(parent.updated_at || parent.created_at) && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Updated {formatDate(parent.updated_at || parent.created_at)}
            </span>
          )}

          <Link
            href={`/kb/item/${parent.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            View session details
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Type summary row ── */}
      {sortedTypes.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {sortedTypes.map(type => {
            const config = getItemTypeConfig(type)
            const count = grouped[type].length
            return (
              <a
                key={type}
                href={`#group-${type}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold">
                  {count}
                </span>
              </a>
            )
          })}
        </div>
      )}

      {/* ── Children Groups ── */}
      {children.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-12 text-center">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No items found in this project yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedTypes.map(type => {
            const items = grouped[type]
            const config = getItemTypeConfig(type)
            return (
              <section key={type} id={`group-${type}`}>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xl">{config.emoji}</span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{config.label}</h2>
                  <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {items.map(item => (
                    <Link
                      key={item.id}
                      href={`/kb/item/${item.id}`}
                      className="group flex items-start gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-4 hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-md hover:shadow-amber-500/5 dark:hover:shadow-amber-500/5 transition-all duration-200"
                    >
                      <span className="text-lg mt-0.5 flex-shrink-0">{config.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug mb-1 truncate">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-1.5">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {item.word_count > 0 && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-600">
                              {item.word_count.toLocaleString()} words
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] rounded-full bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-1.5 py-0.5">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-amber-400 transition-colors mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ProjectPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-8 animate-pulse" />
          <div className="h-9 w-[60%] bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse" />
          <div className="h-4 w-[80%] bg-gray-100 dark:bg-gray-800 rounded mb-8 pb-8 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ProjectContent {...props} />
    </Suspense>
  )
}
