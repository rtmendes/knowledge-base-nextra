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
  const [focused, setFocused] = useState(false)

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
    params.delete('page')
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }, [value, basePath, router, searchParams])

  const handleClear = useCallback(() => {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }, [basePath, router, searchParams])

  return (
    <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.01]' : ''}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className={`w-4.5 h-4.5 transition-colors duration-200 ${focused ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full pl-12 pr-28 py-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 dark:focus:ring-amber-500/30 dark:focus:border-amber-500 shadow-sm transition-all"
      />

      {/* Right side: clear + search button */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1.5">
        {value && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSearch}
          className="inline-flex items-center rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all"
        >
          Search
        </button>
      </div>
    </div>
  )
}
