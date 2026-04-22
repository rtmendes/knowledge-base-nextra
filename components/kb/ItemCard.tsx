import Link from 'next/link'
import { ItemTypeBadge } from './ItemTypeBadge'
import type { KBItem } from '../../lib/supabase-kb'

interface Props {
  item: KBItem
  showCategory?: boolean
  categoryName?: string
  categorySlug?: string
  categoryColor?: string
}

export function ItemCard({ item, showCategory = false, categoryName, categorySlug, categoryColor }: Props) {
  const hasContent = (item.word_count || 0) > 0
  const tags = (item.tags || []).slice(0, 3)

  // Format word count nicely
  const formatWords = (count: number) => {
    if (!count) return null
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k words`
    return `${count} words`
  }

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Link
      href={`/kb/item/${item.id}`}
      className="group flex items-start gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 px-5 py-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md hover:shadow-gray-100/80 dark:hover:shadow-black/20 transition-all duration-200"
    >
      {/* Content status indicator */}
      <div className="flex-shrink-0 pt-1.5">
        <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Title row */}
        <div className="flex items-start gap-2 mb-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 leading-snug">
            {item.title}
          </h3>
          {item.status === 'draft' && (
            <span className="flex-shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
              Draft
            </span>
          )}
        </div>

        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <ItemTypeBadge type={item.item_type} />

          {showCategory && categoryName && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              {categoryColor && (
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: categoryColor }} />
              )}
              {categoryName}
            </span>
          )}

          {formatWords(item.word_count) && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {formatWords(item.word_count)}
            </span>
          )}

          {formatDate(item.updated_at || item.created_at) && (
            <span className="hidden sm:inline text-[11px] text-gray-400 dark:text-gray-600">
              {formatDate(item.updated_at || item.created_at)}
            </span>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-500 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="hidden sm:flex items-center pt-2 flex-shrink-0">
        <svg
          className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors transform group-hover:translate-x-0.5 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
