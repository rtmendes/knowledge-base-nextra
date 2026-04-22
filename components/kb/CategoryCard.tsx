import Link from 'next/link'
import type { KBCategory } from '../../lib/supabase-kb'

// FontAwesome icon class to emoji mapping
const ICON_MAP: Record<string, string> = {
  'fas fa-robot': '🤖',
  'fas fa-cogs': '⚙️',
  'fas fa-plane': '✈️',
  'fas fa-gem': '💎',
  'fas fa-chart-line': '📈',
  'fas fa-bullhorn': '📢',
  'fas fa-graduation-cap': '🎓',
  'fas fa-pray': '🙏',
  'fas fa-heartbeat': '💪',
  'fas fa-utensils': '🍽️',
  'fas fa-folder': '📁',
  'fas fa-book': '📚',
  'fas fa-star': '⭐',
  'fas fa-music': '🎵',
  'fas fa-newspaper': '📰',
  'fas fa-users': '👨‍👩‍👧‍👦',
  'fas fa-dollar-sign': '💰',
  'fas fa-store': '🏪',
  'fas fa-home': '🏠',
  'fas fa-flask': '🔬',
  'fas fa-search': '🔍',
  'fas fa-code': '💻',
  'fas fa-server': '🖥️',
  'fas fa-video': '🎬',
  'fas fa-heart': '❤️',
  'fas fa-play-circle': '▶️',
}

interface Props {
  category: KBCategory
  compact?: boolean
}

export function CategoryCard({ category, compact = false }: Props) {
  const icon = ICON_MAP[category.icon] || '📄'
  
  if (compact) {
    return (
      <Link
        href={`/kb/${category.slug}`}
        className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 px-4 py-3 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-md transition-all duration-200"
      >
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {category.name}
          </div>
        </div>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">
          {category.item_count.toLocaleString()}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href={`/kb/${category.slug}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/40 p-5 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${category.color}08 0%, transparent 60%)` }}
      />
      
      <div className="relative">
        {/* Icon + count */}
        <div className="flex items-start justify-between mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${category.color}15` }}
          >
            {icon}
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700/50 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300 tabular-nums">
            {category.item_count.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-[15px]">
          {category.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">
          {category.description}
        </p>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {category.item_count > 0 ? `${category.item_count} items` : 'Empty'}
            </span>
          </div>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Browse →
          </span>
        </div>
      </div>
    </Link>
  )
}
