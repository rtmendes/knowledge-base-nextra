'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  defaultCategoryId?: string
}

const ITEM_TYPES = [
  { value: 'sop', label: 'SOP', emoji: '📋' },
  { value: 'prd', label: 'PRD', emoji: '📐' },
  { value: 'agent', label: 'Agent', emoji: '🤖' },
  { value: 'inspiration', label: 'Inspiration', emoji: '💡' },
  { value: 'interactive', label: 'Interactive', emoji: '🌐' },
  { value: 'imported', label: 'Document', emoji: '📄' },
  { value: 'launch_plan', label: 'Launch Plan', emoji: '🚀' },
  { value: 'spreadsheet', label: 'Spreadsheet', emoji: '📊' },
]

export function CreateItemModal({ isOpen, onClose, categories, defaultCategoryId }: CreateItemModalProps) {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '')
  const [itemType, setItemType] = useState('imported')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setError(null)
      setCreating(false)
      if (defaultCategoryId) setCategoryId(defaultCategoryId)
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [isOpen, defaultCategoryId])

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/kb/items/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category_id: categoryId,
          item_type: itemType,
          content: '',
          status: 'draft',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create item')
      }

      const data = await res.json()
      onClose()
      router.push(`/kb/item/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    }
    setCreating(false)
  }

  if (!isOpen) return null

  const activeCategories = categories.filter(c => (c as any).item_count > 0 || true)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📝</span>
            Create New Page
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Page Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Q2 Marketing Strategy…"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none"
            >
              <option value="">Select a category…</option>
              {activeCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ITEM_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setItemType(t.value)}
                  className={`
                    flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs transition-all
                    ${itemType === t.value
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !title.trim() || !categoryId}
            className={`
              inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${creating || !title.trim() || !categoryId
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow'}
            `}
          >
            {creating ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Page
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
