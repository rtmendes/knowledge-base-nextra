import Link from 'next/link'
import { Suspense } from 'react'
import { getCategories, getItems, getTotalStats, getItemTypeCounts } from '../../lib/supabase-kb'
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

  // If searching or filtering, show items instead of categories
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

  // Build category lookup for item display
  const catMap = new Map(categories.map(c => [c.id, c]))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/"
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-2">
          Knowledge Base
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
          {stats.totalItems.toLocaleString()} items across {stats.totalCategories} categories · {stats.totalWithContent.toLocaleString()} with full content
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
          <SearchBar basePath="/kb" placeholder="Search across all knowledge items…" />
        </Suspense>
      </div>

      {/* Type filter */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <TypeFilter basePath="/kb" typeCounts={typeCounts} currentType={itemType} />
        </Suspense>
      </div>

      {isFiltered ? (
        /* Search / Filter Results */
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {search && <span>Results for &ldquo;{search}&rdquo; · </span>}
              {total.toLocaleString()} items found
            </h2>
            {isFiltered && (
              <Link href="/kb" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {items.map(item => (
              <ItemCard 
                key={item.id} 
                item={item}
                showCategory
                categoryName={catMap.get(item.category_id)?.name}
              />
            ))}
            {items.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No items found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
          <Suspense fallback={null}>
            <Pagination currentPage={page} totalPages={totalPages} total={total} basePath="/kb" />
          </Suspense>
        </>
      ) : (
        /* Category Grid */
        <>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {categories
              .filter(c => c.item_count > 0)
              .map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
          </div>

          {/* Empty categories */}
          {categories.some(c => c.item_count === 0) && (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 mt-8">
                Empty Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {categories
                  .filter(c => c.item_count === 0)
                  .map(cat => (
                    <CategoryCard key={cat.id} category={cat} compact />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Stats footer */}
      <div className="mt-12 rounded-xl border border-amber-200/50 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
          {[
            { value: stats.totalItems.toLocaleString(), label: 'Total items' },
            { value: stats.totalCategories.toString(), label: 'Categories' },
            { value: stats.totalWithContent.toLocaleString(), label: 'With content' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              {i > 0 && (
                <span className="hidden sm:block w-px h-7 bg-amber-200 dark:bg-amber-700/40" />
              )}
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </span>
                <span className="ml-1.5 text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function KBPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <KBContent {...props} />
    </Suspense>
  )
}
