'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BlockNoteEditor,
  PartialBlock,
  filterSuggestionItems,
  insertOrUpdateBlock,
} from '@blocknote/core'
import {
  useCreateBlockNote,
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'

// ── Types ────────────────────────────────────────────────────────────────────

interface KBContentEditorProps {
  content: string
  onChange: (html: string) => void
  itemId?: string
}

// ── HTML detection ───────────────────────────────────────────────────────────

function detectIsHtml(content: string): boolean {
  const htmlTagPattern =
    /<(div|p|h[1-6]|ul|ol|li|table|tr|td|th|span|a|img|section|article|header|footer|main|nav|blockquote|pre|code|br|hr|strong|em|b|i)\b[^>]*>/i
  if (htmlTagPattern.test(content)) {
    const tagCount = (content.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length
    if (tagCount >= 3) return true
  }
  return false
}

// ── Markdown → HTML converter ────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  let html = md
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || 'text'}">${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  })
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+[.)]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/^[-*_]{3,}$/gm, '<hr />')
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[1-6]|pre|blockquote|li|hr|ul|ol|table|img)/.test(trimmed)) return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')
  return html
}

function prepareContentForEditor(content: string): string {
  if (!content || content.trim() === '') return '<p></p>'
  if (detectIsHtml(content)) return content
  return markdownToHtml(content)
}

// ── Upload handler (→ Supabase kb-media bucket) ──────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/kb/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(err.error || 'Upload failed')
  }
  return (await res.json()).url
}

// ── Mantine dark theme ───────────────────────────────────────────────────────

const mantineTheme = createTheme({
  primaryColor: 'yellow',
})

// ── Main Editor Component ────────────────────────────────────────────────────

export function KBContentEditor({ content, onChange, itemId }: KBContentEditorProps) {
  const [showSource, setShowSource] = useState(false)
  const [sourceHtml, setSourceHtml] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      )
    }
    checkDark()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', checkDark)
    const obs = new MutationObserver(checkDark)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => { mq.removeEventListener('change', checkDark); obs.disconnect() }
  }, [])

  const htmlContent = useMemo(() => prepareContentForEditor(content), [content])

  // Create the full-featured BlockNote editor
  const editor = useCreateBlockNote({
    uploadFile,
    domAttributes: {
      editor: { class: 'kb-blocknote-editor', 'data-color-scheme': isDarkMode ? 'dark' : 'light' },
    },
  })

  // Load initial HTML content
  useEffect(() => {
    if (!editor || !htmlContent) return
    ;(async () => {
      try {
        const blocks = await editor.tryParseHTMLToBlocks(htmlContent)
        editor.replaceBlocks(editor.document, blocks)
      } catch (e) {
        console.error('Failed to parse HTML into blocks:', e)
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync changes
  useEffect(() => {
    if (!editor) return
    const handleChange = async () => {
      try {
        const html = await editor.blocksToHTMLLossy(editor.document)
        onChangeRef.current(html)
        if (showSource) setSourceHtml(html)
      } catch (e) { /* transient */ }
    }
    editor.onChange(handleChange)
  }, [editor, showSource])

  const handleToggleSource = useCallback(async () => {
    if (!editor) return
    if (!showSource) {
      setSourceHtml(await editor.blocksToHTMLLossy(editor.document))
    }
    setShowSource((s) => !s)
  }, [editor, showSource])

  const handleSourceChange = useCallback(
    async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newHtml = e.target.value
      setSourceHtml(newHtml)
      if (editor) {
        try {
          const blocks = await editor.tryParseHTMLToBlocks(newHtml)
          editor.replaceBlocks(editor.document, blocks)
        } catch { /* ignore invalid HTML */ }
        onChangeRef.current(newHtml)
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
    <MantineProvider theme={mantineTheme} forceColorScheme={isDarkMode ? 'dark' : 'light'}>
      <div className="kb-editor-wrapper rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-visible">
        {/* Hint toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-800/95">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>💡</span>
            <span>
              Type <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">/</kbd> for
              slash commands · Drag blocks via <span className="text-gray-600 dark:text-gray-300 font-bold">⠿</span> handle · Drop files to upload · <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Tab</kbd> to nest
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleSource}
            title="View/Edit HTML Source"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              showSource
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
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
              className="w-full min-h-[500px] px-6 py-5 pt-8 bg-gray-950 text-gray-100 font-mono text-sm leading-6 resize-y focus:outline-none"
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="kb-blocknote-container">
            <BlockNoteView
              editor={editor}
              theme={isDarkMode ? 'dark' : 'light'}
              sideMenu={true}
              slashMenu={true}
              formattingToolbar={true}
              filePanel={true}
              tableHandles={true}
              emojiPicker={true}
            />
          </div>
        )}
      </div>
    </MantineProvider>
  )
}
