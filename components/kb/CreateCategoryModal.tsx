'use client'

import React, { useState, useCallback } from 'react'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (category: any) => void
  parentCategoryId?: string
}

const ICON_OPTIONS = [
  { value: 'fas fa-folder', label: '📁 Folder' },
  { value: 'fas fa-robot', label: '🤖 Robot' },
  { value: 'fas fa-code', label: '💻 Code' },
  { value: 'fas fa-book', label: '📖 Book' },
  { value: 'fas fa-chart-line', label: '📈 Analytics' },
  { value: 'fas fa-rocket', label: '🚀 Rocket' },
  { value: 'fas fa-gem', label: '💎 Premium' },
  { value: 'fas fa-bullhorn', label: '📢 Marketing' },
  { value: 'fas fa-graduation-cap', label: '🎓 Education' },
  { value: 'fas fa-cogs', label: '⚙️ Settings' },
  { value: 'fas fa-star', label: '⭐ Star' },
  { value: 'fas fa-heart', label: '❤️ Heart' },
  { value: 'fas fa-flask', label: '🔬 Research' },
  { value: 'fas fa-server', label: '🖥️ Server' },
  { value: 'fas fa-video', label: '🎬 Video' },
  { value: 'fas fa-store', label: '🏪 Store' },
]

const COLOR_OPTIONS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6b7280', '#334155',
]

export function CreateCategoryModal({ isOpen, onClose, onCreated, parentCategoryId }: CreateCategoryModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('fas fa-folder')
  const [color, setColor] = useState('#6366f1')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = useCallback(async () => {
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/kb/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon, color, description, parent_category_id: parentCategoryId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create category'); return }
      onCreated?.(data)
      setName(''); setDescription(''); setIcon('fas fa-folder'); setColor('#6366f1')
      onClose()
    } catch (err) {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }, [name, icon, color, description, parentCategoryId, onCreated, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {parentCategoryId ? 'New Sub-Category' : 'New Category'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AI Research"
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setIcon(opt.value)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${icon === opt.value ? 'bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-400 scale-110' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  title={opt.label}
                >
                  {opt.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg shadow-sm transition-all"
          >
            {saving ? 'Creating…' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}
