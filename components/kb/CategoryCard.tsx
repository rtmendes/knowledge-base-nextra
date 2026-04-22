import Link from 'next/link'
import type { KBCategory } from '../../lib/supabase-kb'
import { getCategoryIcon } from '../../lib/supabase-kb'

interface Props {
  category: KBCategory
  compact?: boolean
}

export function CategoryCard({ category, compact = false }: Props) {
  const icon = getCategoryIcon(category.icon)

  if (compact) {
    return (
      <Link
        href={`/kb/${category.slug}`}
        className="group flex items-center gap-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-4 py-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
      >
        <span className="text-lg opacity-40 group-hover:opacity-70 transition-opacity">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors truncate">
          {category.name}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/kb/${category.slug}`}
      className="kb-fade-in group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300 overflow-hidden"
    >
      {/* Color accent bar at top */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: category.color || '#f59e0b' }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Icon + Count row */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm"
            style={{
              backgroundColor: `${category.color}12`,
              border: `1px solid ${category.color}20`,
            }}
          >
            {icon}
          </div>
          <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">
            {category.item_count.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {category.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color || '#f59e0b' }}
            />
            <span className="text-[11px] text-gray-400 dark:text-gray-600">
              {category.item_count > 0
                ? `${category.item_count.toLocaleString()} items`
                : 'Empty'}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">
            Browse
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
