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

type Tab = 'create' | 'ingest'

export function CreateItemModal({ isOpen, onClose, categories, defaultCategoryId }: CreateItemModalProps) {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<Tab>('create')

  // Create tab state
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '')
  const [itemType, setItemType] = useState('imported')
  const [tags, setTags] = useState('')

  // Ingest tab state
  const [url, setUrl] = useState('')
  const [ingestCategoryId, setIngestCategoryId] = useState(defaultCategoryId || '')
  const [ingestTags, setIngestTags] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setUrl('')
      setTags('')
      setIngestTags('')
      setError(null)
      setBusy(false)
      setActiveTab('create')
      if (defaultCategoryId) {
        setCategoryId(defaultCategoryId)
        setIngestCategoryId(defaultCategoryId)
      }
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [isOpen, defaultCategoryId])

  const handleCreate = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    if (!categoryId) { setError('Please select a category'); return }

    setBusy(true)
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
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create item') }
      const data = await res.json()
      onClose()
      router.push(`/kb/item/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    }
    setBusy(false)
  }

  const handleIngest = async () => {
    if (!url.trim()) { setError('URL is required'); return }
    if (!ingestCategoryId) { setError('Please select a category'); return }
    try { new URL(url.trim()) } catch { setError('Enter a valid URL (https://…)'); return }

    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/kb/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          category_id: ingestCategoryId,
          tags: ingestTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Ingest failed') }
      const data = await res.json()
      onClose()
      router.push(`/kb/item/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    }
    setBusy(false)
  }

  if (!isOpen) return null

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => { setActiveTab('create'); setError(null) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'create' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              📝 New Page
            </button>
            <button
              onClick={() => { setActiveTab('ingest'); setError(null); setTimeout(() => urlRef.current?.focus(), 50) }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'ingest' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              🔗 Ingest URL
            </button>
          </div>
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
          {activeTab === 'create' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Page Title</label>
                <input ref={titleRef} type="text" value={title} onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. Q2 Marketing Strategy…" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls + ' appearance-none'}>
                  <option value="">Select a category…</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {ITEM_TYPES.map(t => (
                    <button key={t.value} onClick={() => setItemType(t.value)}
                      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-xs transition-all ${itemType === t.value ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span className="font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma-separated, optional)</span></label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="strategy, q2, priority…" className={inputCls} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">URL to import</label>
                <input ref={urlRef} type="url" value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleIngest()}
                  placeholder="https://example.com/article…" className={inputCls} />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Scrapes the page and saves full content to the KB.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
                <select value={ingestCategoryId} onChange={e => setIngestCategoryId(e.target.value)} className={inputCls + ' appearance-none'}>
                  <option value="">Select a category…</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Tags <span className="text-gray-400 font-normal">(comma-separated, optional)</span></label>
                <input type="text" value={ingestTags} onChange={e => setIngestTags(e.target.value)}
                  placeholder="research, reference…" className={inputCls} />
              </div>
            </>
          )}

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
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            Cancel
          </button>
          {activeTab === 'create' ? (
            <button onClick={handleCreate} disabled={busy || !title.trim() || !categoryId}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${busy || !title.trim() || !categoryId ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow'}`}
            >
              {busy ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Create Page</>}
            </button>
          ) : (
            <button onClick={handleIngest} disabled={busy || !url.trim() || !ingestCategoryId}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${busy || !url.trim() || !ingestCategoryId ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow'}`}
            >
              {busy ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing…</> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Import URL</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
