import Link from 'next/link'
import { Suspense } from 'react'
import { getCategories, getItems, getTotalStats, getItemTypeCounts, getCategoryIcon } from '../../lib/supabase-kb'
import { CategoryCard } from '../../components/kb/CategoryCard'
import { ItemCard } from '../../components/kb/ItemCard'
import { SearchBar } from '../../components/kb/SearchBar'
import { TypeFilter } from '../../components/kb/TypeFilter'
import { Pagination } from '../../components/kb/Pagination'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Knowledge Base — InsightProfit',
  description: 'Browse all 11,591 knowledge items across 28 categories. Search, filter, and explore the InsightProfit knowledge base.',
}

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>
}

async function KBContent({ searchParams }: Props) {
  const params = await searchParams
  const search = params.q || ''
  const itemType = params.type || ''
  const page = parseInt(params.page || '1', 10)

  const [categories, stats, typeCounts] = await Promise.all([
    getCategories(),
    getTotalStats(),
    getItemTypeCounts(),
  ])

  const isFiltered = !!(search || itemType)
  let items: any[] = []
  let total = 0
  let totalPages = 1

  if (isFiltered) {
    const result = await getItems({ search, itemType, page, limit: 50 })
    items = result.items
    total = result.total
    totalPages = Math.ceil(total / 50)
  }

  const catMap = new Map(categories.map(c => [c.id, c]))
  const activeCategories = categories.filter(c => c.item_count > 0)
  const emptyCategories = categories.filter(c => c.item_count === 0)

  // Top categories for featured section
  const featuredCategories = [...activeCategories]
    .sort((a, b) => b.item_count - a.item_count)
    .slice(0, 8)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <div className="pt-8 pb-10 sm:pt-12 sm:pb-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-6 text-xs text-gray-400 dark:text-gray-500">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Knowledge Base</span>
        </nav>

        {/* Title block */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-3">
            Knowledge Base
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Search and explore {stats.totalItems.toLocaleString()} items across {stats.totalCategories} categories.
            Your central hub for SOPs, research, AI agents, product docs, and inspiration.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-6 mt-6">
          {[
            { value: stats.totalItems.toLocaleString(), label: 'Items', icon: '📚' },
            { value: stats.totalCategories.toString(), label: 'Categories', icon: '🗂️' },
            { value: stats.totalWithContent.toLocaleString(), label: 'With content', icon: '📝' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-base">{stat.icon}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">{stat.value}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────── */}
      <div className="pb-2">
        <div className="max-w-2xl mb-4">
          <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
            <SearchBar basePath="/kb" placeholder="Search across all knowledge items…" />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <TypeFilter basePath="/kb" typeCounts={typeCounts} currentType={itemType} />
        </Suspense>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <hr className="border-gray-200 dark:border-gray-800 my-6" />

      {isFiltered ? (
        /* ── Search / Filter Results ──────────────────────────────── */
        <div className="pb-16">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {search && <>Results for &ldquo;{search}&rdquo;</>}
                {search && itemType && <> · </>}
                {itemType && <span className="capitalize">{itemType.replace(/_/g, ' ')}</span>}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {total.toLocaleString()} items found
              </p>
            </div>
            <Link
              href="/kb"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear filters
            </Link>
          </div>

          <div className="space-y-2">
            {items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                showCategory
                categoryName={catMap.get(item.category_id)?.name}
                categorySlug={catMap.get(item.category_id)?.slug}
                categoryColor={catMap.get(item.category_id)?.color}
              />
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No items found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Try adjusting your search terms or removing filters to see more results.
              </p>
            </div>
          )}

          <Suspense fallback={null}>
            <Pagination currentPage={page} totalPages={totalPages} total={total} basePath="/kb" />
          </Suspense>
        </div>
      ) : (
        /* ── Category Browse ──────────────────────────────────────── */
        <div className="pb-16">
          {/* Featured categories */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Browse Categories
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {activeCategories.length} active categories
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 kb-stagger">
              {activeCategories.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>

          {/* Empty categories */}
          {emptyCategories.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-3">
                Coming Soon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {emptyCategories.map(cat => (
                  <CategoryCard key={cat.id} category={cat} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function KBPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="h-12 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3 animate-pulse" />
        <div className="h-5 w-[480px] max-w-full bg-gray-100 dark:bg-gray-800 rounded mb-8 animate-pulse" />
        <div className="h-12 max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 animate-pulse" />
        <hr className="border-gray-200 dark:border-gray-800 my-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <KBContent {...props} />
    </Suspense>
  )
}
