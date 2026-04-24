'use client'

import React, { useState, useCallback } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

interface BulkOperationsBarProps {
  selectedIds: Set<string>
  categories: Category[]
  onClearSelection: () => void
  onOperationComplete: () => void
}

export function BulkOperationsBar({ selectedIds, categories, onClearSelection, onOperationComplete }: BulkOperationsBarProps) {
  const [executing, setExecuting] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const count = selectedIds.size
  if (count === 0) return null

  const executeBulk = useCallback(async (action: string, extra: Record<string, any> = {}) => {
    setExecuting(true)
    try {
      const res = await fetch('/api/kb/items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, item_ids: [...selectedIds], ...extra }),
      })
      const data = await res.json()
      if (res.ok) {
        onOperationComplete()
        onClearSelection()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setExecuting(false)
      setShowMoveMenu(false)
      setShowTagMenu(false)
      setShowConfirmDelete(false)
    }
  }, [selectedIds, onOperationComplete, onClearSelection])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl shadow-2xl border border-gray-700 dark:border-gray-300 animate-in slide-in-from-bottom">
      {/* Count */}
      <span className="text-xs font-semibold tabular-nums min-w-[3rem]">
        {count} selected
      </span>

      <div className="w-px h-5 bg-gray-700 dark:bg-gray-300" />

      {/* Move */}
      <div className="relative">
        <button
          onClick={() => { setShowMoveMenu(!showMoveMenu); setShowTagMenu(false); setShowConfirmDelete(false) }}
          disabled={executing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
          Move to…
        </button>
        {showMoveMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-56 max-h-72 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => executeBulk('move', { category_id: cat.id })}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag */}
      <div className="relative">
        <button
          onClick={() => { setShowTagMenu(!showTagMenu); setShowMoveMenu(false); setShowConfirmDelete(false) }}
          disabled={executing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          Tag…
        </button>
        {showTagMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tag name…"
              className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  executeBulk('tag', { tags_add: [tagInput.trim()] })
                  setTagInput('')
                }
              }}
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => { if (tagInput.trim()) executeBulk('tag', { tags_add: [tagInput.trim()] }); setTagInput('') }}
                disabled={!tagInput.trim()}
                className="flex-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-40 transition-colors"
              >
                + Add Tag
              </button>
              <button
                onClick={() => { if (tagInput.trim()) executeBulk('tag', { tags_remove: [tagInput.trim()] }); setTagInput('') }}
                disabled={!tagInput.trim()}
                className="flex-1 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-40 transition-colors"
              >
                − Remove Tag
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="relative">
        {showConfirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-300">Delete {count}?</span>
            <button
              onClick={() => executeBulk('delete')}
              disabled={executing}
              className="px-3 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setShowConfirmDelete(true); setShowMoveMenu(false); setShowTagMenu(false) }}
            disabled={executing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-gray-700 dark:bg-gray-300" />

      {/* Clear */}
      <button
        onClick={onClearSelection}
        className="p-1.5 text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors"
        title="Clear selection"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {executing && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 dark:bg-gray-100/80 rounded-xl">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
