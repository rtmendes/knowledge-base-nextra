'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { ColumnDef, ColumnType, DatabaseRow, InlineDatabase } from './types'

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return 'col_' + Math.random().toString(36).substring(2, 10)
}

const COLUMN_TYPE_ICONS: Record<ColumnType, string> = {
  title: '📄',
  text: '📝',
  number: '#️⃣',
  select: '🔽',
  multi_select: '🏷️',
  date: '📅',
  checkbox: '☑️',
  url: '🔗',
  relation: '🔀',
  kb_link: '📎',
}

const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  title: 'Title',
  text: 'Text',
  number: 'Number',
  select: 'Select',
  multi_select: 'Multi-select',
  date: 'Date',
  checkbox: 'Checkbox',
  url: 'URL',
  relation: 'Relation',
  kb_link: 'KB Link',
}

// ── Cell Renderers ───────────────────────────────────────────────────────────

function CellEditor({
  column,
  value,
  onChange,
  onOpenPage,
}: {
  column: ColumnDef
  value: any
  onChange: (val: any) => void
  onOpenPage?: () => void
}) {
  switch (column.type) {
    case 'title':
      return (
        <div className="flex items-center gap-1.5 w-full">
          {onOpenPage && (
            <button
              onClick={onOpenPage}
              className="shrink-0 text-gray-400 hover:text-amber-500 transition-colors"
              title="Open as page"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            placeholder="Untitled"
          />
        </div>
      )

    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
          placeholder="Empty"
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 tabular-nums"
          placeholder="0"
        />
      )

    case 'checkbox':
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
        </div>
      )

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
        />
      )

    case 'url':
      return (
        <div className="flex items-center gap-1">
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-blue-600 dark:text-blue-400 underline placeholder:text-gray-400 placeholder:no-underline"
            placeholder="https://..."
          />
          {value && (
            <a href={value} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-400 hover:text-blue-500">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      )

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          <option value="">—</option>
          {(column.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )

    case 'multi_select': {
      const selected: string[] = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-wrap gap-1">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
            >
              {tag}
              <button
                onClick={() => onChange(selected.filter((t) => t !== tag))}
                className="hover:text-red-500 ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value && !selected.includes(e.target.value)) {
                onChange([...selected, e.target.value])
              }
            }}
            className="bg-transparent border-none outline-none text-xs text-gray-400 cursor-pointer"
          >
            <option value="">+</option>
            {(column.options || [])
              .filter((opt) => !selected.includes(opt))
              .map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
          </select>
        </div>
      )
    }

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
        />
      )
  }
}

// ── Add Column Modal ─────────────────────────────────────────────────────────

function AddColumnModal({
  onAdd,
  onClose,
}: {
  onAdd: (col: ColumnDef) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ColumnType>('text')
  const [options, setOptions] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const col: ColumnDef = {
      id: generateId(),
      name: name.trim(),
      type,
      width: type === 'checkbox' ? 80 : 160,
    }
    if ((type === 'select' || type === 'multi_select') && options.trim()) {
      col.options = options.split(',').map((o) => o.trim()).filter(Boolean)
    }
    onAdd(col)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-5 w-80 space-y-4"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add Column</h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-amber-500/40"
            placeholder="Column name"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ColumnType)}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
          >
            {(Object.keys(COLUMN_TYPE_LABELS) as ColumnType[])
              .filter((t) => t !== 'title') // can't add a second title column
              .map((t) => (
                <option key={t} value={t}>
                  {COLUMN_TYPE_ICONS[t]} {COLUMN_TYPE_LABELS[t]}
                </option>
              ))}
          </select>
        </div>

        {(type === 'select' || type === 'multi_select') && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Options (comma-separated)</label>
            <input
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none"
              placeholder="Option 1, Option 2, ..."
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
          >
            Add Column
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface InlineDatabaseViewProps {
  databaseId: string
  /** If provided, renders in compact/embed mode */
  compact?: boolean
  /** Max rows to show in compact mode */
  maxRows?: number
}

export function InlineDatabaseView({ databaseId, compact, maxRows }: InlineDatabaseViewProps) {
  const [db, setDb] = useState<InlineDatabase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddColumn, setShowAddColumn] = useState(false)
  const [editingDbName, setEditingDbName] = useState(false)
  const [dbNameDraft, setDbNameDraft] = useState('')
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchDatabase = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/kb/databases/${databaseId}`)
      if (!res.ok) throw new Error('Failed to load database')
      const data = await res.json()
      setDb(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [databaseId])

  useEffect(() => { fetchDatabase() }, [fetchDatabase])

  // ── Update helpers ─────────────────────────────────────────────────────────

  const updateDatabase = useCallback(async (updates: Partial<InlineDatabase>) => {
    if (!db) return
    const res = await fetch(`/api/kb/databases/${db.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setDb((prev) => prev ? { ...prev, ...updated, rows: prev.rows, relations: prev.relations } : prev)
    }
  }, [db])

  const addRow = useCallback(async () => {
    if (!db) return
    const res = await fetch(`/api/kb/databases/${db.id}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: {}, create_linked_item: false }),
    })
    if (res.ok) {
      const newRow = await res.json()
      setDb((prev) => prev ? { ...prev, rows: [...prev.rows, newRow] } : prev)
    }
  }, [db])

  const addRowAsPage = useCallback(async () => {
    if (!db) return
    const titleCol = db.columns.find((c) => c.type === 'title')
    const values: Record<string, any> = {}
    if (titleCol) values[titleCol.id] = 'Untitled'
    const res = await fetch(`/api/kb/databases/${db.id}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values, create_linked_item: true }),
    })
    if (res.ok) {
      const newRow = await res.json()
      setDb((prev) => prev ? { ...prev, rows: [...prev.rows, newRow] } : prev)
    }
  }, [db])

  const updateRow = useCallback(async (rowId: string, values: Record<string, any>) => {
    if (!db) return
    // Optimistic update
    setDb((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId ? { ...r, values: { ...r.values, ...values } } : r
        ),
      }
    })

    // Debounced save
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      const currentRow = db.rows.find((r) => r.id === rowId)
      const mergedValues = { ...(currentRow?.values || {}), ...values }
      await fetch(`/api/kb/databases/${db.id}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: mergedValues }),
      })
    }, 500)
  }, [db])

  const deleteRow = useCallback(async (rowId: string) => {
    if (!db) return
    setDb((prev) => prev ? { ...prev, rows: prev.rows.filter((r) => r.id !== rowId) } : prev)
    await fetch(`/api/kb/databases/${db.id}/rows/${rowId}`, { method: 'DELETE' })
  }, [db])

  const addColumn = useCallback(async (col: ColumnDef) => {
    if (!db) return
    const newColumns = [...db.columns, col]
    await updateDatabase({ columns: newColumns } as any)
    setDb((prev) => prev ? { ...prev, columns: newColumns } : prev)
    setShowAddColumn(false)
  }, [db, updateDatabase])

  const deleteColumn = useCallback(async (colId: string) => {
    if (!db) return
    const newColumns = db.columns.filter((c) => c.id !== colId)
    await updateDatabase({ columns: newColumns } as any)
    setDb((prev) => prev ? { ...prev, columns: newColumns } : prev)
  }, [db, updateDatabase])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading database…
        </div>
      </div>
    )
  }

  if (error || !db) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
        ⚠️ {error || 'Database not found'}
      </div>
    )
  }

  const displayRows = compact && maxRows ? db.rows.slice(0, maxRows) : db.rows
  const hasMore = compact && maxRows ? db.rows.length > maxRows : false

  return (
    <div className="kb-inline-database rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-base">🗃️</span>
          {editingDbName ? (
            <input
              autoFocus
              value={dbNameDraft}
              onChange={(e) => setDbNameDraft(e.target.value)}
              onBlur={() => {
                if (dbNameDraft.trim() && dbNameDraft !== db.name) {
                  updateDatabase({ name: dbNameDraft.trim() } as any)
                  setDb((prev) => prev ? { ...prev, name: dbNameDraft.trim() } : prev)
                }
                setEditingDbName(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') setEditingDbName(false)
              }}
              className="bg-transparent border-none outline-none text-sm font-semibold text-gray-900 dark:text-gray-100"
            />
          ) : (
            <button
              onClick={() => { setDbNameDraft(db.name); setEditingDbName(true) }}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {db.name}
            </button>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {db.rows.length} row{db.rows.length !== 1 ? 's' : ''}
          </span>
        </div>

        {!compact && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddColumn(true)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 5v14m-7-7h14" />
              </svg>
              Column
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {db.columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width || 160, minWidth: col.width || 160 }}
                  className="group px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{COLUMN_TYPE_ICONS[col.type]}</span>
                    <span>{col.name}</span>
                    {!compact && col.type !== 'title' && (
                      <button
                        onClick={() => deleteColumn(col.id)}
                        className="opacity-0 group-hover:opacity-100 ml-auto text-gray-400 hover:text-red-500 transition-all"
                        title="Delete column"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {!compact && (
                <th className="w-10 px-2 py-2 bg-gray-50/50 dark:bg-gray-800/30" />
              )}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr
                key={row.id}
                className="group border-b border-gray-50 dark:border-gray-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors"
              >
                {db.columns.map((col) => (
                  <td
                    key={col.id}
                    className="px-3 py-1.5 align-middle"
                    style={{ maxWidth: col.width || 160 }}
                  >
                    <CellEditor
                      column={col}
                      value={row.values[col.id]}
                      onChange={(val) => updateRow(row.id, { [col.id]: val })}
                      onOpenPage={
                        col.type === 'title' && row.linked_item_id
                          ? () => window.open(`/kb/item/${row.linked_item_id}`, '_blank')
                          : undefined
                      }
                    />
                  </td>
                ))}
                {!compact && (
                  <td className="px-2 py-1.5 align-middle">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      title="Delete row"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!compact && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14m-7-7h14" />
            </svg>
            New row
          </button>
          <button
            onClick={addRowAsPage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            New page row
          </button>
        </div>
      )}

      {hasMore && (
        <div className="px-3 py-2 text-center border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400">
            +{db.rows.length - (maxRows || 0)} more rows
          </span>
        </div>
      )}

      {/* Add Column Modal */}
      {showAddColumn && (
        <AddColumnModal onAdd={addColumn} onClose={() => setShowAddColumn(false)} />
      )}
    </div>
  )
}
