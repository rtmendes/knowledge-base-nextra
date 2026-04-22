'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { getItemTypeConfig } from '../../lib/supabase-kb'

interface Props {
  basePath: string
  typeCounts: Record<string, number>
  currentType?: string
}

export function TypeFilter({ basePath, typeCounts, currentType }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTypeChange = (type: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type) {
      params.set('type', type)
    } else {
      params.delete('type')
    }
    params.delete('page')
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }

  const sortedTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
  
  if (sortedTypes.length <= 1) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => handleTypeChange(null)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          !currentType
            ? 'bg-amber-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {sortedTypes.map(([type, count]) => {
        const config = getItemTypeConfig(type)
        const isActive = currentType === type
        return (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
            <span className={`ml-0.5 ${isActive ? 'text-amber-100' : 'text-gray-400 dark:text-gray-500'}`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
