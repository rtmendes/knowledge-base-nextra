import Link from 'next/link'
import { Suspense } from 'react'
import { getItems } from '../../../../../lib/supabase-kb'
import { ItemCard } from '../../../../../components/kb/ItemCard'
import { SearchBar } from '../../../../../components/kb/SearchBar'
import { Pagination } from '../../../../../components/kb/Pagination'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params
  const label = decodeURIComponent(tag)
  return {
    title: `#${label} — Knowledge Base — InsightProfit`,
    description: `All knowledge items tagged "${label}" across every category`,
  }
}

async function TagContent({ params, searchParams }: Props) {
  const { tag } = await params
  const sp = await searchParams
  const label = decodeURIComponent(tag)

  const search = sp.q || ''
  const page = parseInt(sp.page || '1', 10)
  const limit = 50

  const { items, total } = await getItems({ tag: label, status: 'active', search, page, limit })
  const totalPages = Math.ceil(total / limit)
  const basePath = `/kb/tag/${encodeURIComponent(label)}`

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pt-8 pb-8 sm:pt-12 sm:pb-10">
        <nav className="flex items-center gap-2 mb-6 text-xs text-gray-400 dark:text-gray-500">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/kb" className="hover:text-amber-500 transition-colors">Knowledge Base</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-600 dark:text-gray-300 font-medium">#{label}</span>
        </nav>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40">
            🏷️
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-1">
              #{label}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {total.toLocaleString()} items across all categories
            </span>
          </div>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="pb-2">
        <div className="max-w-xl mb-4">
          <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
            <SearchBar basePath={basePath} placeholder={`Search within #${label}…`} />
          </Suspense>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800 my-5" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {search ? (
            <>Results for &ldquo;{search}&rdquo; · {total.toLocaleString()} found</>
          ) : (
            <>{total.toLocaleString()} items</>
          )}
        </h2>
        {search && (
          <Link href={basePath} className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Clear search
          </Link>
        )}
      </div>

      <div className="space-y-2 pb-4">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No items tagged #{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try a different tag or browse the full knowledge base.
          </p>
        </div>
      )}

      <Suspense fallback={null}>
        <Pagination currentPage={page} totalPages={totalPages} total={total} basePath={basePath} />
      </Suspense>

      <div className="py-8 border-t border-gray-200 dark:border-gray-800 mt-4">
        <Link href="/kb" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to all categories
        </Link>
      </div>
    </div>
  )
}

export default function TagPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[72px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <TagContent {...props} />
    </Suspense>
  )
}
