import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { getCategories, getItems, getTotalStats, getItemTypeCounts, getCategoryIcon } from '../../lib/supabase-kb'
import { CategoryCard } from '../../components/kb/CategoryCard'
import { ItemCard } from '../../components/kb/ItemCard'
import { SearchBar } from '../../components/kb/SearchBar'
import { SemanticSearchBar } from '../../components/kb/SemanticSearchBar'
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

  // Top 6 categories get the featured (large cover image) treatment
  const featuredCategories = [...activeCategories]
    .sort((a, b) => b.item_count - a.item_count)
    .slice(0, 6)

  const remainingCategories = activeCategories
    .filter(c => !featuredCategories.find(f => f.id === c.id))
    .sort((a, b) => b.item_count - a.item_count)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── Hero Section with Cover Image ────────────────────────── */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
        {/* Hero background image */}
        <div className="relative h-72 sm:h-80 lg:h-96">
          <Image
            src="/images/kb-hero.webp"
            alt="Knowledge Base Command Center"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Multi-layer gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/50 to-gray-950/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/20 via-transparent to-amber-950/20" />
          
          {/* Content on top of hero */}
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-5 text-xs text-gray-300/80">
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white font-medium">Knowledge Base</span>
            </nav>

            {/* Title + Description */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">📚</span>
                </div>
                <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">InsightProfit</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-lg">
                Knowledge Base
              </h1>
              <p className="text-base sm:text-lg text-gray-300/90 leading-relaxed max-w-2xl">
                Search and explore {stats.totalItems.toLocaleString()} items across {stats.totalCategories} categories.
                Your central hub for SOPs, research, AI agents, product docs, and inspiration.
              </p>
            </div>

            {/* Stats pills — glassmorphism */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {[
                { value: stats.totalItems.toLocaleString(), label: 'Items', icon: '📚', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20' },
                { value: stats.totalCategories.toString(), label: 'Categories', icon: '🗂️', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20' },
                { value: stats.totalWithContent.toLocaleString(), label: 'With content', icon: '📝', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r ${stat.color} backdrop-blur-md border shadow-lg shadow-black/10`}
                >
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{stat.value}</span>
                  <span className="text-xs text-gray-300/70">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────── */}
      <div className="pt-8 pb-2">
        <div className="max-w-2xl mb-4">
          <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
            <SemanticSearchBar basePath="/kb" placeholder="AI-powered search across all knowledge items…" />
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
          {/* Featured categories — large cards with cover images */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Featured Collections
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Top categories by content volume
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeCategories.length} active
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 kb-stagger">
              {featuredCategories.map(cat => (
                <CategoryCard key={cat.id} category={cat} featured />
              ))}
            </div>
          </div>

          {/* All other categories — standard cards with thumbnail strips */}
          {remainingCategories.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  All Categories
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {remainingCategories.length} more
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 kb-stagger">
                {remainingCategories.map(cat => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          )}

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 h-72 sm:h-80 lg:h-96 bg-gray-900 animate-pulse overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950" />
          <div className="absolute bottom-8 left-4 sm:left-6 lg:left-8">
            <div className="h-8 w-48 bg-gray-800 rounded-lg mb-3 animate-pulse" />
            <div className="h-12 w-80 bg-gray-800 rounded-lg mb-3 animate-pulse" />
            <div className="h-5 w-[480px] max-w-full bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="pt-8">
          <div className="h-12 max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 animate-pulse" />
          <hr className="border-gray-200 dark:border-gray-800 my-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <KBContent {...props} />
    </Suspense>
  )
}
