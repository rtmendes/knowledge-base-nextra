import Link from 'next/link'
import { ItemTypeBadge } from './ItemTypeBadge'
import type { KBItem } from '../../lib/supabase-kb'

interface Props {
  item: KBItem
  showCategory?: boolean
  categoryName?: string
}

export function ItemCard({ item, showCategory = false, categoryName }: Props) {
  const hasContent = (item.word_count || 0) > 0
  const wordStr = item.word_count ? `${item.word_count.toLocaleString()} words` : 'No content'
  const tags = (item.tags || []).slice(0, 3)

  return (
    <Link
      href={`/kb/item/${item.id}`}
      className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 px-5 py-4 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-md transition-all duration-200"
    >
      {/* Content indicator */}
      <div className={`hidden sm:flex w-1 h-10 rounded-full flex-shrink-0 ${hasContent ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
      
      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.status === 'draft' && (
            <span className="flex-shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
              Draft
            </span>
          )}
        </div>
        
        {/* Summary */}
        {item.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-1.5">
            {item.summary}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <ItemTypeBadge type={item.item_type} />
          {showCategory && categoryName && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              in {categoryName}
            </span>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {wordStr}
          </span>
          {tags.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <span className="hidden sm:flex items-center text-gray-300 dark:text-gray-600 group-hover:text-amber-500 transition-colors flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}
