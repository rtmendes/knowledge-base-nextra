'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

interface Props {
  basePath: string
  placeholder?: string
  defaultValue?: string
}

export function SearchBar({ basePath, placeholder = 'Search knowledge base…', defaultValue = '' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue || searchParams.get('q') || '')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) setValue(q)
  }, [searchParams])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset to page 1 on search
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }, [value, basePath, router, searchParams])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder={placeholder}
        className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all"
      />
      <button
        onClick={handleSearch}
        className="absolute inset-y-0 right-0 flex items-center pr-1.5"
      >
        <span className="inline-flex items-center rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors">
          Search
        </span>
      </button>
    </div>
  )
}
