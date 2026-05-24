'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { KBContentRenderer } from './KBContentRenderer'

/**
 * Heuristic: count structural HTML block elements in the first 10 KB.
 * Requires 10+ block tags outnumbering markdown markers before treating
 * content as rich HTML. The higher threshold (up from 5) reduces false
 * positives and keeps the inline-HTML path limited to clearly HTML-native
 * content. The renderer applies a sanitisation pass on the resulting HTML.
 */
function detectIsHtmlContent(content: string): boolean {
  if (!content || content.length < 100) return false
  const sample = content.slice(0, 10000)
  const blockTags = sample.match(
    /<(p|div|h[1-6]|ul|ol|table|section|article|header|footer|main|aside|figure|dl|dd|dt)\s*[^>]*>/gi
  ) || []
  if (blockTags.length < 10) return false
  const mdMarkers = (sample.match(/^#{1,6}\s|\*\*[^*]+\*\*|^[-*]\s+\w|^\d+\.\s+\w|^```/gm) || []).length
  return blockTags.length > mdMarkers
}

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

// ── Native HTML iframe viewer ─────────────────────────────────────────────
// Renders the stored HTML string in a sandboxed iframe using a local blob URL.
// This gives "looks and works exactly like the original" output without any
// external network calls. The source stays in Supabase so it's still fully
// searchable and editable in the knowledge base.
function HtmlIframeViewer({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string>('')

  useEffect(() => {
    // Build the blob URL on the client only (not during SSR)
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => {
      // Always revoke when content changes or component unmounts
      URL.revokeObjectURL(url)
    }
  }, [content])

  if (!blobUrl) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 h-[600px] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Preparing render…</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">🌐</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Native HTML Render</span>
          <span className="inline-flex items-center text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800/50">
            Live Preview
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          {expanded ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Expand to full height
            </>
          )}
        </button>
      </div>
      <div
        className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md transition-all duration-300"
        style={{ height: expanded ? '82vh' : '600px' }}
      >
        <iframe
          src={blobUrl}
          className="w-full h-full bg-white"
          sandbox="allow-scripts allow-same-origin"
          title="Rendered HTML content"
          loading="lazy"
        />
      </div>
    </div>
  )
}

interface Props {
  itemId: string
  content: string
  contentPlain?: string
  itemType?: string
  metadata?: Record<string, any> | null
}

interface VersionEntry {
  id: string
  version_number: number
  word_count: number
  edited_by: string
  created_at: string
}

// The three content tabs — only shown when content is HTML
type ContentTab = 'rendered' | 'preview' | 'source'

const TABS: { id: ContentTab; label: string; emoji: string; title: string }[] = [
  { id: 'rendered', label: 'Rendered', emoji: '🌐', title: 'Live HTML — looks and behaves like the original page' },
  { id: 'preview', label: 'Preview', emoji: '📄', title: 'Formatted view — searchable and readable' },
  { id: 'source',  label: 'Source',   emoji: '{}', title: 'Raw HTML source text' },
]

export function KBContentSection({ itemId, content, contentPlain, itemType, metadata }: Props) {
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

  const displayContent = currentContent || contentPlain || ''
  const isHtml = useMemo(() => detectIsHtmlContent(displayContent), [displayContent])

  // Default to the Rendered tab for HTML content, Preview otherwise.
  // User's tab choice is remembered for the session.
  const [activeTab, setActiveTab] = useState<ContentTab>(isHtml ? 'rendered' : 'preview')

  // If content changes to HTML after mount (e.g. after a save that adds HTML),
  // switch to the Rendered tab so the user immediately sees the result.
  useEffect(() => {
    if (isHtml && activeTab === 'preview') setActiveTab('rendered')
  }, [isHtml]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div>
      {/* ── Action Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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

      {/* ── Tab Bar — only shown for HTML content when not editing ──────── */}
      {isHtml && !isEditing && displayContent && (
        <div className="flex items-center gap-0 mb-5 border-b border-gray-200 dark:border-gray-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
                border-b-2 -mb-px transition-all
                ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto pr-1 pb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 px-2 py-0.5 rounded-full">
              ✨ HTML Content
            </span>
          </div>
        </div>
      )}

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
        // Editor takes over all tabs — show edit hint when content is HTML
        <div>
          {isHtml && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2.5">
              <span className="text-indigo-500">🌐</span>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                Editing HTML content — changes will update all three tabs when saved
              </span>
            </div>
          )}
          <KBContentEditor content={displayContent} onChange={setEditContent} itemId={itemId} />
        </div>
      ) : displayContent ? (
        isHtml ? (
          // ── Tabbed view for HTML items ───────────────────────
          <>
            {activeTab === 'rendered' && (
              <HtmlIframeViewer content={displayContent} />
            )}
            {activeTab === 'preview' && (
              <KBContentRenderer
                content={displayContent}
                isHtml={isHtml}
                itemType={itemType}
                metadata={metadata}
              />
            )}
            {activeTab === 'source' && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Raw HTML Source
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-600 font-mono">
                    {displayContent.length.toLocaleString()} chars
                  </span>
                </div>
                <pre className="p-5 text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap break-words">
                  {displayContent}
                </pre>
              </div>
            )}
          </>
        ) : (
          // ── Single view for markdown / plain items ───────────
          <KBContentRenderer
            content={displayContent}
            isHtml={isHtml}
            itemType={itemType}
            metadata={metadata}
          />
        )
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
