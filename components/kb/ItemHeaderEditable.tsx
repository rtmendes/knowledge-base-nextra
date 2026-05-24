'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  itemId: string
  initialTitle: string
  initialTags: string[]
}

/**
 * ItemHeaderEditable — inline-editable title and tags widget for KB item pages.
 *
 * Design:
 * - Title: click the pencil icon to enter edit mode, type in the input, Save or Escape to finish.
 * - Tags: click the × on any tag to remove it; type a new tag and press Enter or comma to add.
 * - Saves via PATCH /api/kb/items/[id]/update-meta (title + tags fields only).
 */
export function ItemHeaderEditable({ itemId, initialTitle, initialTags }: Props) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [draftTitle, setDraftTitle] = useState(initialTitle)

  const [tags, setTags] = useState<string[]>(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [editingTags, setEditingTags] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  useEffect(() => {
    if (editingTags && tagInputRef.current) tagInputRef.current.focus()
  }, [editingTags])

  const saveMeta = useCallback(async (newTitle?: string, newTags?: string[]) => {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {}
      if (newTitle !== undefined) body.title = newTitle
      if (newTags !== undefined) body.tags = newTags

      const res = await fetch(`/api/kb/items/${itemId}/update-meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Save failed')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }, [itemId])

  /* ── Title handlers ─────────────────────────────────────────── */
  const startEditTitle = () => { setDraftTitle(title); setEditingTitle(true) }

  const saveTitle = async () => {
    const trimmed = draftTitle.trim()
    if (!trimmed || trimmed === title) { setEditingTitle(false); return }
    await saveMeta(trimmed)
    setTitle(trimmed)
    setEditingTitle(false)
    // Update the browser tab title
    document.title = `${trimmed} — Knowledge Base — InsightProfit`
  }

  const cancelTitle = () => { setEditingTitle(false); setDraftTitle(title) }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); saveTitle() }
    if (e.key === 'Escape') cancelTitle()
  }

  /* ── Tag handlers ───────────────────────────────────────────── */
  const addTag = useCallback(async (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/,+$/, '')
    if (!tag || tags.includes(tag)) return
    const next = [...tags, tag]
    setTags(next)
    setTagInput('')
    await saveMeta(undefined, next)
  }, [tags, saveMeta])

  const removeTag = useCallback(async (tag: string) => {
    const next = tags.filter(t => t !== tag)
    setTags(next)
    await saveMeta(undefined, next)
  }, [tags, saveMeta])

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
    if (e.key === 'Escape') { setEditingTags(false); setTagInput('') }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div>
      {/* ── Title ─────────────────────────────────────────────── */}
      <div className="group relative flex items-start gap-2 mb-4">
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              ref={titleInputRef}
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-transparent border-b-2 border-amber-400 focus:outline-none text-gray-900 dark:text-gray-50 kb-item-title"
              placeholder="Enter title…"
              maxLength={300}
            />
            <button
              onClick={saveTitle}
              disabled={saving}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={cancelTitle}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1 className="flex-1 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight kb-item-title">
              {title}
            </h1>
            <button
              onClick={startEditTitle}
              className="flex-shrink-0 mt-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              title="Edit title"
              aria-label="Edit title"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Tags ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {tags.map(tag => (
          <span
            key={tag}
            className="group/tag inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 pl-2.5 pr-1.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="opacity-0 group-hover/tag:opacity-100 rounded-full hover:text-red-500 dark:hover:text-red-400 transition-all p-0.5"
              title={`Remove tag "${tag}"`}
              aria-label={`Remove tag ${tag}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Inline tag input */}
        {editingTags ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 pl-2.5 pr-1.5 py-0.5">
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput) addTag(tagInput); else setEditingTags(false) }}
              className="text-xs bg-transparent focus:outline-none text-amber-700 dark:text-amber-300 placeholder-amber-400 dark:placeholder-amber-600 w-24"
              placeholder="Add tag…"
              maxLength={60}
            />
            <kbd className="text-[9px] text-amber-500 dark:text-amber-500 opacity-60">↵</kbd>
          </div>
        ) : (
          <button
            onClick={() => setEditingTags(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            title="Add a tag"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add tag
          </button>
        )}
      </div>

      {/* Feedback messages */}
      {saved && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in mb-2">✓ Saved</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mb-2">{error}</p>
      )}
    </div>
  )
}
