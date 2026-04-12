'use client'

import { useState, useRef } from 'react'

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const slugRef = useRef<HTMLInputElement>(null)

  async function handleFileImport(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setStatus('loading')
    setMessage('Importing...')

    const text = await file.text()
    const slug = slugRef.current?.value || file.name.replace(/\.(md|mdx|txt)$/i, '').replace(/\s+/g, '-').toLowerCase()

    const res = await fetch('/api/import-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, slug, filename: file.name }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('success')
      setMessage(`✅ Imported as "${data.title}"`)
      setDocUrl(`/${data.slug}`)
    } else {
      setStatus('error')
      setMessage(`❌ Error: ${data.error}`)
    }
  }

  async function handleUrlImport(e: React.FormEvent) {
    e.preventDefault()
    const url = urlRef.current?.value?.trim()
    if (!url) return

    setStatus('loading')
    setMessage('Fetching and importing...')

    const res = await fetch('/api/import-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('success')
      setMessage(`✅ Imported as "${data.title}"`)
      setDocUrl(`/${data.slug}`)
    } else {
      setStatus('error')
      setMessage(`❌ Error: ${data.error}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">Import Markdown</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Upload a <code>.md</code>, <code>.mdx</code>, or <code>.txt</code> file — it will be
        auto-converted to a knowledge base doc. You can also paste a URL to a raw markdown file.
      </p>

      {/* File upload */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">📁 Upload file</h2>
        <form onSubmit={handleFileImport} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File (.md / .mdx / .txt)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.mdx,.txt"
              required
              className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-950 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (optional — auto-generated from filename)
            </label>
            <input
              ref={slugRef}
              type="text"
              placeholder="my-doc-slug"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="self-start rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? 'Importing…' : 'Import'}
          </button>
        </form>
      </div>

      {/* URL import */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">🔗 Import from URL</h2>
        <form onSubmit={handleUrlImport} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raw Markdown URL
            </label>
            <input
              ref={urlRef}
              type="url"
              placeholder="https://raw.githubusercontent.com/..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="self-start rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? 'Fetching…' : 'Import from URL'}
          </button>
        </form>
      </div>

      {/* Status */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm font-medium ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : status === 'error'
              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          }`}
        >
          {message}
          {status === 'success' && docUrl && (
            <a
              href={docUrl}
              className="ml-2 underline hover:no-underline"
            >
              View doc →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
