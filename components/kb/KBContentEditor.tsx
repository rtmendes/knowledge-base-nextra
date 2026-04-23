'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BlockNoteEditor,
  PartialBlock,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from '@blocknote/core'
import { useCreateBlockNote, BlockNoteView } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/react/style.css'

// ── Types ────────────────────────────────────────────────────────────────────

interface KBContentEditorProps {
  content: string
  onChange: (html: string) => void
  itemId?: string
}

// ── HTML detection (mirrors KBContentRenderer logic) ─────────────────────────

function detectIsHtml(content: string): boolean {
  const htmlTagPattern =
    /<(div|p|h[1-6]|ul|ol|li|table|tr|td|th|span|a|img|section|article|header|footer|main|nav|blockquote|pre|code|br|hr|strong|em|b|i)\b[^>]*>/i
  if (htmlTagPattern.test(content)) {
    const tagCount = (content.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length
    if (tagCount >= 3) return true
  }
  return false
}

// ── Markdown → HTML converter (lightweight, for loading) ─────────────────────

function markdownToHtml(md: string): string {
  let html = md
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  })
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  // Bold/italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
  // Unordered lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
  // Ordered lists
  html = html.replace(/^\d+[.)]\s+(.+)$/gm, '<li>$1</li>')
  // Horizontal rules
  html = html.replace(/^[-*_]{3,}$/gm, '<hr />')
  // Paragraphs - wrap remaining lines
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<img')
      )
        return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  return html
}

function prepareContentForEditor(content: string): string {
  if (!content || content.trim() === '') {
    return '<p></p>'
  }
  if (detectIsHtml(content)) {
    return content
  }
  return markdownToHtml(content)
}

// ── Upload handler ───────────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/kb/upload', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error || 'Upload failed')
  }

  const data = await res.json()
  return data.url
}

// ── Main Editor Component ────────────────────────────────────────────────────

export function KBContentEditor({ content, onChange, itemId }: KBContentEditorProps) {
  const [showSource, setShowSource] = useState(false)
  const [sourceHtml, setSourceHtml] = useState('')
  const editorRef = useRef<BlockNoteEditor | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const htmlContent = useMemo(() => prepareContentForEditor(content), [content])

  const editor = useCreateBlockNote({
    initialContent: undefined, // Will be set via replaceBlocks after mount
    uploadFile: async (file: File) => {
      const url = await uploadFile(file)
      return url
    },
    domAttributes: {
      editor: {
        class: 'kb-blocknote-editor',
      },
    },
  })

  // Load initial HTML content into the editor
  useEffect(() => {
    if (!editor || !htmlContent) return
    const loadContent = async () => {
      try {
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent)
        editor.replaceBlocks(editor.document, blocks)
      } catch (e) {
        console.error('Failed to parse HTML into blocks:', e)
      }
    }
    loadContent()
  }, []) // Only on mount

  // Sync editor changes to parent
  useEffect(() => {
    if (!editor) return
    editorRef.current = editor

    const handleChange = async () => {
      try {
        const html = await editor.blocksToHTMLLossy(editor.document)
        onChangeRef.current(html)
        if (showSource) {
          setSourceHtml(html)
        }
      } catch (e) {
        // Ignore transient errors during editing
      }
    }

    // Subscribe to changes
    editor.onChange(handleChange)
  }, [editor, showSource])

  const handleToggleSource = useCallback(async () => {
    if (!editor) return
    if (!showSource) {
      const html = await editor.blocksToHTMLLossy(editor.document)
      setSourceHtml(html)
    }
    setShowSource(!showSource)
  }, [editor, showSource])

  const handleSourceChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newHtml = e.target.value
      setSourceHtml(newHtml)
      if (editor) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(newHtml)
          editor.replaceBlocks(editor.document, blocks)
          onChangeRef.current(newHtml)
        } catch (err) {
          // If HTML is invalid, just update the raw value
          onChangeRef.current(newHtml)
        }
      }
    },
    [editor]
  )

  if (!editor) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading editor…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="kb-editor-wrapper rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Source toggle button */}
      <div className="flex items-center justify-end px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-800/95">
        <button
          type="button"
          onClick={handleToggleSource}
          title="View/Edit HTML Source"
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150
            ${
              showSource
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
            }
          `}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          {showSource ? 'Rich Editor' : 'HTML Source'}
        </button>
      </div>

      {showSource ? (
        <div className="relative">
          <div className="absolute top-2 right-3 text-[10px] font-mono text-gray-400 dark:text-gray-600 uppercase tracking-wider select-none z-10">
            HTML Source
          </div>
          <textarea
            value={sourceHtml}
            onChange={handleSourceChange}
            className="w-full min-h-[500px] px-6 py-5 pt-8 bg-gray-950 dark:bg-gray-950 text-gray-100 font-mono text-sm leading-6 resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="kb-blocknote-wrapper">
          <BlockNoteView
            editor={editor}
            theme="light"
            data-theming-css-variables-demo
          />
        </div>
      )}
    </div>
  )
}
