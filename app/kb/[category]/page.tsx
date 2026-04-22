import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getCategoryBySlug, getItems, getItemTypeCounts } from '../../../lib/supabase-kb'
import { ItemCard } from '../../../components/kb/ItemCard'
import { SearchBar } from '../../../components/kb/SearchBar'
import { TypeFilter } from '../../../components/kb/TypeFilter'
import { Pagination } from '../../../components/kb/Pagination'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ category: string }>
  searchParams: Promise<{ q?: string; type?: string; page?: string }>
}

// Icon mapping
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

export async function generateMetadata({ params }: Props) {
  const { category: slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) return { title: 'Category Not Found' }
  return {
    title: `${cat.name} — Knowledge Base — InsightProfit`,
    description: cat.description,
  }
}

async function CategoryContent({ params, searchParams }: Props) {
  const { category: slug } = await params
  const sp = await searchParams
  
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const search = sp.q || ''
  const itemType = sp.type || ''
  const page = parseInt(sp.page || '1', 10)
  const limit = 50

  const [result, typeCounts] = await Promise.all([
    getItems({ categoryId: category.id, search, itemType, page, limit }),
    getItemTypeCounts(category.id),
  ])

  const { items, total } = result
  const totalPages = Math.ceil(total / limit)
  const icon = ICON_MAP[category.icon] || '📄'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        <Link href="/" className="text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors">Home</Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <Link href="/kb" className="text-gray-400 dark:text-gray-500 hover:text-amber-500 transition-colors">Knowledge Base</Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="font-medium text-gray-600 dark:text-gray-300">{category.name}</span>
      </div>

      {/* Category header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}15` }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {category.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.item_count.toLocaleString()} items
            </p>
          </div>
        </div>
        {category.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-5">
        <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />}>
          <SearchBar basePath={`/kb/${slug}`} placeholder={`Search in ${category.name}…`} />
        </Suspense>
      </div>

      {/* Type filter */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <TypeFilter basePath={`/kb/${slug}`} typeCounts={typeCounts} currentType={itemType} />
        </Suspense>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {search ? `Results for "${search}" · ${total} found` : `${total.toLocaleString()} Items`}
        </h2>
        {(search || itemType) && (
          <Link href={`/kb/${slug}`} className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
            Clear filters
          </Link>
        )}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
              {search ? 'No matching items' : 'No items in this category'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search ? 'Try adjusting your search terms' : 'Items will appear here once added'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Suspense fallback={null}>
        <Pagination currentPage={page} totalPages={totalPages} total={total} basePath={`/kb/${slug}`} />
      </Suspense>
    </div>
  )
}

export default function CategoryPage(props: Props) {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <CategoryContent {...props} />
    </Suspense>
  )
}
