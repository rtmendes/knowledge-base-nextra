'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'

interface Tag {
  name: string
  count: number
}

interface TagsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TagsPanel({ isOpen, onClose }: TagsPanelProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'name'>('count')
  const [totalTags, setTotalTags] = useState(0)

  const loadTags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/kb/tags?limit=500`)
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
        setTotalTags(data.total || 0)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen && tags.length === 0) loadTags()
  }, [isOpen, loadTags, tags.length])

  const filteredTags = useMemo(() => {
    let result = tags
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t => t.name.toLowerCase().includes(q))
    }
    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }
    return result
  }, [tags, search, sortBy])

  const maxCount = Math.max(...tags.map(t => t.count), 1)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Tags ({totalTags})
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tags…"
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400/30"
              />
            </div>
            <button
              onClick={() => setSortBy(sortBy === 'count' ? 'name' : 'count')}
              className="flex-shrink-0 px-2 py-1.5 text-[10px] font-medium bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Sort by ${sortBy === 'count' ? 'name' : 'count'}`}
            >
              {sortBy === 'count' ? '# Count' : 'A→Z'}
            </button>
          </div>
        </div>

        {/* Tags List */}
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              {search ? 'No tags match your search' : 'No tags found'}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredTags.map(tag => {
                const barWidth = Math.max(4, (tag.count / maxCount) * 100)
                return (
                  <Link
                    key={tag.name}
                    href={`/kb?tag=${encodeURIComponent(tag.name)}`}
                    onClick={onClose}
                    className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {tag.name}
                        </span>
                        <span className="text-[10px] text-gray-400 tabular-nums flex-shrink-0 ml-2">
                          {tag.count}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400/60 dark:bg-amber-500/40 rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
          {filteredTags.length} of {totalTags} tags shown
        </div>
      </div>
    </>
  )
}
