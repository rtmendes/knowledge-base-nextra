'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  totalPages: number
  total: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, total, basePath }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }

  // Generate page numbers to show
  const pages: number[] = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i)
  }
  if (pages[0] > 1) { pages.unshift(1); if (pages[1] > 2) pages.splice(1, 0, -1) }
  if (pages[pages.length - 1] < totalPages) { if (pages[pages.length - 1] < totalPages - 1) pages.push(-1); pages.push(totalPages) }

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {total.toLocaleString()} total items · Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === -1 ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                p === currentPage
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
