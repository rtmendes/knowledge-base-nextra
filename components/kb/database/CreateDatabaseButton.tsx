'use client'

import React, { useCallback, useState } from 'react'

interface CreateDatabaseButtonProps {
  parentItemId: string
  onCreated: (databaseId: string) => void
}

export function CreateDatabaseButton({ parentItemId, onCreated }: CreateDatabaseButtonProps) {
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/kb/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          parent_item_id: parentItemId,
          columns: [
            { id: 'col_title', name: 'Name', type: 'title', width: 250 },
            { id: 'col_status', name: 'Status', type: 'select', options: ['Active', 'In Progress', 'Done', 'Archived'], width: 130 },
            { id: 'col_tags', name: 'Tags', type: 'multi_select', options: [], width: 180 },
            { id: 'col_date', name: 'Date', type: 'date', width: 130 },
          ],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        onCreated(data.id)
        setShowForm(false)
        setName('')
      }
    } finally {
      setCreating(false)
    }
  }, [name, parentItemId, onCreated])

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all"
      >
        <span className="text-base">🗃️</span>
        Add Inline Database
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCreate()
          if (e.key === 'Escape') setShowForm(false)
        }}
        placeholder="Database name..."
        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-amber-500/40 text-gray-900 dark:text-gray-100"
      />
      <button
        onClick={handleCreate}
        disabled={creating || !name.trim()}
        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        {creating ? '…' : 'Create'}
      </button>
      <button
        onClick={() => setShowForm(false)}
        className="px-2 py-1.5 text-sm text-gray-400 hover:text-gray-600"
      >
        Cancel
      </button>
    </div>
  )
}
