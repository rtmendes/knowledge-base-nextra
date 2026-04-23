'use client'

import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { KBContentRenderer } from './KBContentRenderer'

// Dynamically import editor to avoid SSR issues with BlockNote
const KBContentEditor = dynamic(
  () => import('./KBContentEditor').then((mod) => ({ default: mod.KBContentEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading editor…</span>
        </div>
      </div>
    ),
  }
)

interface Props {
  itemId: string
  content: string
  contentPlain?: string
  itemType?: string
}

interface VersionEntry {
  id: string
  version_number: number
  word_count: number
  edited_by: string
  created_at: string
}

export function KBContentSection({ itemId, content, contentPlain, itemType }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentContent, setCurrentContent] = useState(content)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [wordCount, setWordCount] = useState<number | null>(null)

  // Version history
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)

  const handleEdit = useCallback(() => {
    setEditContent(currentContent)
    setSaveError(null)
    setSaveSuccess(false)
    setIsEditing(true)
  }, [currentContent])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditContent('')
    setSaveError(null)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const res = await fetch(`/api/kb/items/${itemId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setCurrentContent(editContent)
      setWordCount(data.word_count)
      setIsEditing(false)
      setSaveSuccess(true)

      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }, [itemId, editContent])

  const loadVersions = useCallback(async () => {
    if (showVersions) {
      setShowVersions(false)
      return
    }
    setLoadingVersions(true)
    try {
      const res = await fetch(`/api/kb/items/${itemId}/versions`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data.versions || [])
      }
    } catch (e) {
      console.error('Failed to load versions:', e)
    } finally {
      setLoadingVersions(false)
      setShowVersions(true)
    }
  }, [itemId, showVersions])

  const restoreVersion = useCallback(
    async (version: VersionEntry) => {
      if (!confirm(`Restore to version ${version.version_number}? Current content will be saved as a new version first.`)) {
        return
      }
      try {
        const res = await fetch(`/api/kb/items/${itemId}/versions/${version.id}/restore`, {
          method: 'POST',
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentContent(data.content)
          setShowVersions(false)
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 4000)
        }
      } catch (e) {
        console.error('Failed to restore version:', e)
      }
    },
    [itemId]
  )

  const displayContent = currentContent || contentPlain || ''

  return (
    <div>
      {/* ── Action Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 animate-fade-in">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved successfully</span>
              {wordCount !== null && (
                <span className="text-gray-400 dark:text-gray-600 text-xs ml-1">
                  ({wordCount.toLocaleString()} words)
                </span>
              )}
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{saveError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Version History Button */}
          <button
            onClick={loadVersions}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Version History"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {loadingVersions ? 'Loading…' : 'History'}
          </button>

          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Content
            </button>
          )}
        </div>
      </div>

      {/* ── Version History Panel ────────────────────────────────── */}
      {showVersions && (
        <div className="mb-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Version History</h3>
          </div>
          {versions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No previous versions found. Versions are created each time you save.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      v{v.version_number}
                    </span>
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(v.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {v.word_count.toLocaleString()} words · by {v.edited_by || 'anonymous'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => restoreVersion(v)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Content Area ────────────────────────────────────────── */}
      {isEditing ? (
        <KBContentEditor content={displayContent} onChange={setEditContent} itemId={itemId} />
      ) : displayContent ? (
        <KBContentRenderer content={displayContent} itemType={itemType} />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-3">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">No content yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            This item doesn&apos;t have content yet. Click &quot;Edit Content&quot; to add some.
          </p>
        </div>
      )}
    </div>
  )
}
