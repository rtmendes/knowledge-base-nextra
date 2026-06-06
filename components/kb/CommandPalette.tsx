'use client'

import React, { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  item_type: string
  category_name?: string
  category_slug?: string
  summary?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onCreateItem?: () => void
}

const TYPE_ICONS: Record<string, string> = {
  genspark_chat: '⚡', manus_session: '🤖', manus_doc: '📄', sop: '📋',
  prd: '📐', inspiration: '💡', agent: '🤖', interactive: '🌐',
  chatgpt_chat: '💬', spark: '✨', imported: '📥',
}

export function CommandPalette({ isOpen, onClose, onCreateItem }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Parent needs to handle opening
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isOpen, onClose])

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/kb/items?q=${encodeURIComponent(query.trim())}&limit=12`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.items || [])
          setSelectedIndex(0)
        }
      } catch {}
      setLoading(false)
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const commands = getCommands()
    const totalItems = results.length + commands.length

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % totalItems)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex < results.length) {
        navigateToItem(results[selectedIndex].id)
      } else {
        const cmdIndex = selectedIndex - results.length
        commands[cmdIndex]?.action()
      }
    }
  }, [results, selectedIndex])

  const navigateToItem = (id: string) => {
    router.push(`/kb/item/${id}`)
    onClose()
  }

  const getCommands = () => {
    const cmds = [
      { icon: '📚', label: 'Browse All Categories', action: () => { router.push('/kb'); onClose() } },
    ]
    if (onCreateItem) {
      cmds.unshift({ icon: '➕', label: 'Create New Page', action: () => { onCreateItem(); onClose() } })
    }
    return cmds
  }

  if (!isOpen) return null

  const commands = getCommands()

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, SOPs, PRDs…"
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Searching…</span>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Pages
                </span>
              </div>
              {results.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => navigateToItem(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${selectedIndex === i
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  `}
                >
                  <span className="text-base flex-shrink-0">{TYPE_ICONS[item.item_type] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.title}
                    </div>
                    {item.category_name && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {item.category_name}
                      </div>
                    )}
                  </div>
                  {selectedIndex === i && (
                    <kbd className="text-[10px] text-gray-400 font-mono">↵</kbd>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <span className="text-2xl">🔍</span>
              <p className="text-xs text-gray-400 mt-2">No pages found for "{query}"</p>
            </div>
          )}

          {/* Commands */}
          <div>
            {(results.length > 0 || query.trim()) && (
              <hr className="mx-4 my-1 border-gray-100 dark:border-gray-800" />
            )}
            <div className="px-4 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Quick Actions
              </span>
            </div>
            {commands.map((cmd, i) => {
              const globalIndex = results.length + i
              return (
                <button
                  key={cmd.label}
                  onClick={cmd.action}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                    ${selectedIndex === globalIndex
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  `}
                >
                  <span className="text-base">{cmd.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cmd.label}</span>
                  {selectedIndex === globalIndex && (
                    <kbd className="ml-auto text-[10px] text-gray-400 font-mono">↵</kbd>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
