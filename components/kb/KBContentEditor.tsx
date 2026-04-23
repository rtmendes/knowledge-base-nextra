'use client'

import React, { useCallback, useState } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

// ── Types ────────────────────────────────────────────────────────────────────

interface KBContentEditorProps {
  content: string
  onChange: (html: string) => void
}

// ── Markdown → HTML converter ────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  // Protect code blocks from processing
  const codeBlocks: string[] = []
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.trimEnd()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`)
    return `\n%%CB${codeBlocks.length - 1}%%\n`
  })

  // Protect inline code
  const inlineCodes: string[] = []
  html = html.replace(/`([^`\n]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)
    return `%%IC${inlineCodes.length - 1}%%`
  })

  // Process line by line
  const lines = html.split('\n')
  const output: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (trimmed === '') {
      i++
      continue
    }

    // Code block placeholder
    if (/^%%CB\d+%%$/.test(trimmed)) {
      const idx = parseInt(trimmed.match(/\d+/)![0])
      output.push(codeBlocks[idx])
      i++
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      output.push('<hr />')
      i++
      continue
    }

    // Headings
    const hMatch = trimmed.match(/^(#{1,6})\s+(.+?)(?:\s*#+)?$/)
    if (hMatch) {
      const level = hMatch[1].length
      output.push(`<h${level}>${inlineFmt(hMatch[2])}</h${level}>`)
      i++
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ') || trimmed === '>') {
      const bqLines: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('> ') || lines[i].trim() === '>')) {
        bqLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      output.push(`<blockquote><p>${inlineFmt(bqLines.join('<br />'))}</p></blockquote>`)
      continue
    }

    // Table
    if (/^\|?.+\|.+\|?$/.test(trimmed) && i + 1 < lines.length && /^\|?[\s:|-]+\|/.test(lines[i + 1]?.trim())) {
      const tableLines: string[] = []
      while (i < lines.length && /^\|?.+\|/.test(lines[i]?.trim())) {
        tableLines.push(lines[i].trim())
        i++
      }
      if (tableLines.length >= 2) {
        const parseRow = (r: string) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
        const headers = parseRow(tableLines[0])
        const rows = tableLines.slice(2).map(parseRow)
        let t = '<table><thead><tr>'
        headers.forEach(h => { t += `<th>${inlineFmt(h)}</th>` })
        t += '</tr></thead><tbody>'
        rows.forEach(row => {
          t += '<tr>'
          row.forEach(cell => { t += `<td>${inlineFmt(cell)}</td>` })
          t += '</tr>'
        })
        t += '</tbody></table>'
        output.push(t)
      }
      continue
    }

    // Image (standalone)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch) {
      output.push(`<img src="${imgMatch[2]}" alt="${imgMatch[1]}" />`)
      i++
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s/, ''))
        i++
      }
      output.push('<ul>' + items.map(it => `<li><p>${inlineFmt(it)}</p></li>`).join('') + '</ul>')
      continue
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+[.)]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s*/, ''))
        i++
      }
      output.push('<ol>' + items.map(it => `<li><p>${inlineFmt(it)}</p></li>`).join('') + '</ol>')
      continue
    }

    // Paragraph: collect contiguous non-special lines
    const pLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i].trim()) &&
      !/^```/.test(lines[i].trim()) &&
      !/^>\s/.test(lines[i].trim()) &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^[-*+]\s/.test(lines[i].trim()) &&
      !/^\d+[.)]\s/.test(lines[i].trim()) &&
      !/^%%CB\d+%%$/.test(lines[i].trim()) &&
      !/^\|?.+\|.+\|?$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i])
      i++
    }
    if (pLines.length) {
      output.push(`<p>${inlineFmt(pLines.join('<br />'))}</p>`)
    }
  }

  let result = output.join('\n')

  // Restore inline code
  result = result.replace(/%%IC(\d+)%%/g, (_, idx) => inlineCodes[parseInt(idx)])

  return result
}

function inlineFmt(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

// ── Format detection (mirrors KBContentRenderer logic) ───────────────────────

function detectIsHtml(content: string): boolean {
  const htmlTagPattern = /<(div|p|h[1-6]|ul|ol|li|table|tr|td|th|span|a|img|section|article|header|footer|main|nav|blockquote|pre|code|br|hr|strong|em|b|i)\b[^>]*>/i
  if (htmlTagPattern.test(content)) {
    const tagCount = (content.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length
    if (tagCount >= 3) return true
  }
  return false
}

function prepareContentForEditor(content: string): string {
  if (!content || content.trim() === '') {
    return '<p></p>'
  }

  // Already HTML — use as-is
  if (detectIsHtml(content)) {
    return content
  }

  // Markdown or plain text — convert to HTML
  return markdownToHtml(content)
}

// ── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-md text-sm transition-all duration-150
        ${isActive
          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 flex-shrink-0" />
}

// ── Toolbar Icons (inline SVGs) ──────────────────────────────────────────────

const icons = {
  bold: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  italic: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" /><line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  strikethrough: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h3" /><path d="M12 15h3a3 3 0 0 1 0 6H8" /><line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  code: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  h1: <span className="text-xs font-bold">H1</span>,
  h2: <span className="text-xs font-bold">H2</span>,
  h3: <span className="text-xs font-bold">H3</span>,
  bulletList: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  orderedList: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
      <text x="2" y="8" fontSize="8" fill="currentColor" fontWeight="bold" fontFamily="system-ui">1</text>
      <text x="2" y="14" fontSize="8" fill="currentColor" fontWeight="bold" fontFamily="system-ui">2</text>
      <text x="2" y="20" fontSize="8" fill="currentColor" fontWeight="bold" fontFamily="system-ui">3</text>
    </svg>
  ),
  blockquote: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.178 11 15c0 1.933-1.567 3.5-3.5 3.5-1.14 0-2.204-.47-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.178 21 15c0 1.933-1.567 3.5-3.5 3.5-1.14 0-2.204-.47-2.917-1.179z" />
    </svg>
  ),
  codeBlock: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="9 8 5 12 9 16" /><polyline points="15 8 19 12 15 16" />
    </svg>
  ),
  horizontalRule: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  link: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  ),
  table: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  undo: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  redo: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  sourceCode: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
}

// ── Editor Toolbar ───────────────────────────────────────────────────────────

function EditorToolbar({ editor, showSource, onToggleSource }: { editor: any; showSource: boolean; onToggleSource: () => void }) {
  const addLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  return (
    <div className="kb-editor-toolbar sticky top-0 z-10 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm">
      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
        {icons.undo}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
        {icons.redo}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
        {icons.bold}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
        {icons.italic}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
        {icons.underline}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
        {icons.strikethrough}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
        {icons.code}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
        {icons.h1}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
        {icons.h2}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
        {icons.h3}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
        {icons.bulletList}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
        {icons.orderedList}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
        {icons.blockquote}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
        {icons.codeBlock}
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        {icons.horizontalRule}
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media */}
      <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
        {icons.link}
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        {icons.image}
      </ToolbarButton>
      <ToolbarButton onClick={insertTable} title="Insert Table">
        {icons.table}
      </ToolbarButton>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Source toggle */}
      <ToolbarButton onClick={onToggleSource} isActive={showSource} title="View HTML Source">
        {icons.sourceCode}
      </ToolbarButton>
    </div>
  )
}

// ── Table Bubble Menu ────────────────────────────────────────────────────────

function TableBubbleActions({ editor }: { editor: any }) {
  if (!editor.isActive('table')) return null

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs">
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Add column before"
      >
        + Col ←
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Add column after"
      >
        + Col →
      </button>
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Add row before"
      >
        + Row ↑
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        title="Add row after"
      >
        + Row ↓
      </button>
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
        title="Delete column"
      >
        − Col
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
        title="Delete row"
      >
        − Row
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 font-medium"
        title="Delete table"
      >
        ✕ Table
      </button>
    </div>
  )
}

// ── Main Editor Component ────────────────────────────────────────────────────

export function KBContentEditor({ content, onChange }: KBContentEditorProps) {
  const [showSource, setShowSource] = useState(false)
  const [sourceHtml, setSourceHtml] = useState('')

  const htmlContent = React.useMemo(() => prepareContentForEditor(content), [content])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: {
          HTMLAttributes: { class: 'kb-editor-code-block' },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'kb-editor-link',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: { class: 'kb-editor-image' },
        allowBase64: true,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your content here…',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'kb-editor-table' },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      if (showSource) {
        setSourceHtml(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'kb-editor-content kb-prose focus:outline-none min-h-[400px] px-6 py-5',
      },
    },
  })

  const handleToggleSource = useCallback(() => {
    if (!editor) return
    if (!showSource) {
      // Switching to source view — grab current HTML
      setSourceHtml(editor.getHTML())
    }
    setShowSource(!showSource)
  }, [editor, showSource])

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value
    setSourceHtml(newHtml)
    if (editor) {
      editor.commands.setContent(newHtml)
      onChange(newHtml)
    }
  }, [editor, onChange])

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
      <EditorToolbar editor={editor} showSource={showSource} onToggleSource={handleToggleSource} />

      {showSource ? (
        <div className="relative">
          <div className="absolute top-2 right-3 text-[10px] font-mono text-gray-400 dark:text-gray-600 uppercase tracking-wider select-none z-10">
            HTML Source
          </div>
          <textarea
            value={sourceHtml}
            onChange={handleSourceChange}
            className="w-full min-h-[400px] px-6 py-5 pt-8 bg-gray-950 dark:bg-gray-950 text-gray-100 font-mono text-sm leading-6 resize-y focus:outline-none"
            spellCheck={false}
          />
        </div>
      ) : (
        <>
          {editor.isActive('table') && (
            <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <TableBubbleActions editor={editor} />
            </div>
          )}
          <EditorContent editor={editor} />
        </>
      )}
    </div>
  )
}
