'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'

interface SearchResult {
  id: string
  title: string
  slug: string
  item_type: string
  category_id: string
  summary: string | null
  word_count: number
  similarity: number | null
  preview: string
}

interface Props {
  basePath: string
  placeholder?: string
  defaultValue?: string
}

export function SemanticSearchBar({ basePath, placeholder = 'AI-powered search…', defaultValue = '' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue || searchParams.get('q') || '')
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [searchType, setSearchType] = useState<string>('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) setValue(q)
  }, [searchParams])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSemanticSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/kb/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), limit: 8 }),
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
        setSearchType(data.search_type)
        setShowResults(true)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
    
    // Debounce semantic search
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSemanticSearch(v), 400)
  }, [doSemanticSearch])

  const handleSearch = useCallback(() => {
    setShowResults(false)
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
    setResults([])
    setShowResults(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    const qs = params.toString()
    router.push(`${basePath}${qs ? '?' + qs : ''}`)
  }, [basePath, router, searchParams])

  const typeColors: Record<string, string> = {
    sop: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    prd: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    agent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    guide: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className={`relative transition-all duration-200 ${focused ? 'scale-[1.01]' : ''}`}>
        {/* AI search icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <svg className="w-4.5 h-4.5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className={`w-4.5 h-4.5 transition-colors duration-200 ${focused ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => { setFocused(true); if (results.length > 0) setShowResults(true) }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 dark:focus:ring-amber-500/30 dark:focus:border-amber-500 shadow-sm transition-all"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1.5">
          {value && (
            <button onClick={handleClear} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Clear search">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button onClick={handleSearch} className="inline-flex items-center rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all">
            Search
          </button>
        </div>
      </div>

      {/* Semantic search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-[420px] overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {searchType === 'semantic' ? '🔮 AI Semantic Results' : '📝 Text Results'}
            </span>
            <span className="text-xs text-gray-400">{results.length} matches</span>
          </div>
          {results.map((r) => (
            <button
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault()
                setShowResults(false)
                router.push(`/kb/item/${r.id}`)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${typeColors[r.item_type] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {r.item_type}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {r.title}
                    </span>
                  </div>
                  {r.preview && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {r.preview}
                    </p>
                  )}
                </div>
                {r.similarity !== null && (
                  <span className="flex-shrink-0 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                    {(r.similarity * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
