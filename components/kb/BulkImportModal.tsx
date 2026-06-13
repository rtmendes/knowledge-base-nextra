'use client'

import React, { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
}

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

interface ImportResult {
  url: string
  status: 'pending' | 'done' | 'error'
  title?: string
  id?: string
  error?: string
}

export function BulkImportModal({ isOpen, onClose, categories }: BulkImportModalProps) {
  const [rawUrls, setRawUrls] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [results, setResults] = useState<ImportResult[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRawUrls('')
      setCategoryId('')
      setTags('')
      setResults([])
      setRunning(false)
      setDone(false)
    }
  }, [isOpen])

  const urls = rawUrls.split('\n').map(l => l.trim()).filter(l => {
    try { new URL(l); return true } catch { return false }
  })

  const handleImport = async () => {
    if (!urls.length || !categoryId) return
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)

    const initial: ImportResult[] = urls.map(url => ({ url, status: 'pending' }))
    setResults(initial)
    setRunning(true)

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      try {
        const res = await fetch('/api/kb/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, category_id: categoryId, tags: tagList }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done', title: data.title, id: data.id } : r))
      } catch (err: any) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: err.message } : r))
      }
    }

    setRunning(false)
    setDone(true)
  }

  if (!isOpen) return null

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all'
  const doneCount = results.filter(r => r.status === 'done').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!running ? onClose : undefined} />

      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>📥</span> Bulk Import URLs
          </h2>
          {!running && (
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-5 py-4 space-y-4">
          {!results.length ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  URLs <span className="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={rawUrls}
                  onChange={e => setRawUrls(e.target.value)}
                  rows={6}
                  placeholder={"https://example.com/article-1\nhttps://example.com/article-2\nhttps://example.com/article-3"}
                  className={inputCls + ' resize-none font-mono text-xs'}
                />
                {rawUrls.trim() && (
                  <p className="text-xs text-gray-400 mt-1">{urls.length} valid URL{urls.length !== 1 ? 's' : ''} detected</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls + ' appearance-none'}>
                  <option value="">Select a category…</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Tags <span className="text-gray-400 font-normal">(comma-separated, applied to all)</span>
                </label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="imported, research…" className={inputCls} />
              </div>
            </>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {done && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800 mb-3">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    ✓ Import complete — {doneCount} saved{errorCount > 0 ? `, ${errorCount} failed` : ''}
                  </span>
                </div>
              )}
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="mt-0.5 flex-shrink-0">
                    {r.status === 'pending' && <div className="w-3.5 h-3.5 border-2 border-amber-400/40 border-t-amber-500 rounded-full animate-spin" />}
                    {r.status === 'done' && <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    {r.status === 'error' && <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0">
                    {r.title ? (
                      <a href={`/kb/item/${r.id}`} className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline truncate block">{r.title}</a>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{r.url}</span>
                    )}
                    {r.error && <span className="text-xs text-red-500">{r.error}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          {done ? (
            <button onClick={onClose} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
              Done
            </button>
          ) : (
            <>
              <button onClick={onClose} disabled={running} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={running || !urls.length || !categoryId}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${running || !urls.length || !categoryId ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow'}`}
              >
                {running ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing {doneCount + errorCount}/{urls.length}…</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Import {urls.length} URL{urls.length !== 1 ? 's' : ''}</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
