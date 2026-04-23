'use client'

import React, { useMemo } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  content: string
  itemType?: string
}

type ContentFormat = 'html' | 'markdown' | 'chat' | 'plain'

type TocEntry = { id: string; text: string; level: number }

type Block =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'callout'; variant: 'note' | 'tip' | 'warning' | 'important' | 'caution'; text: string }
  | { type: 'hr' }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'chat-message'; role: 'user' | 'assistant' | 'system'; text: string }

// ── AI Artifact Patterns ─────────────────────────────────────────────────────

const AI_PREFIXES = [
  /^(Sure!|Of course!|Absolutely!|Great question!|Certainly!|Here you go!|Happy to help!|Perfect!|Let me|I'd be happy to|I'll|You're (absolutely )?right|Got it|Understood|No problem)[,!.\s—–-]*/i,
  /^(Here('s| is| are) (the|your|a|an|my|what))[^.]*[.:]\s*/i,
  /^(Let me (help|assist|provide|share|explain|break|walk|give|create|show|do|get|put|write|draft|build))[^.]*[.:]\s*/i,
  /^(I('ve| have| can| will| would| shall) (help|assist|provide|share|explain|create|show|prepare|put|compile|draft|write|build|generate))[^.]*[.:]\s*/i,
  /^(As (requested|you asked|an AI|a language model))[^.]*[.:]\s*/i,
  /^(Based on (your|the|what))[^.]*[,:]\s*/i,
]

const AI_SUFFIXES = [
  /\s*(Let me know if you('d like| need| want| have)|Feel free to|Hope this helps|Is there anything else|Would you like me to|Happy to|If you have any|Don't hesitate)[^]*$/i,
  /\s*(I hope (this|that|the above)|Please (let me know|feel free)|Want me to)[^]*$/i,
]

function stripAIArtifacts(text: string): string {
  let cleaned = text

  // Remove leading AI filler phrases
  for (const pattern of AI_PREFIXES) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Remove trailing AI filler
  for (const pattern of AI_SUFFIXES) {
    cleaned = cleaned.replace(pattern, '')
  }

  return cleaned.trim()
}

// ── Content Format Detection ─────────────────────────────────────────────────

function detectFormat(content: string, itemType?: string): ContentFormat {
  // Chat format: has "assistant:" and "user:" prefixes
  if (itemType === 'chatgpt_chat' || itemType === 'manus_session') {
    const lines = content.split('\n')
    let chatLineCount = 0
    for (const line of lines.slice(0, 30)) {
      if (/^(assistant|user|system|human|ai)\s*:/i.test(line.trim())) {
        chatLineCount++
      }
    }
    if (chatLineCount >= 2) return 'chat'
  }

  // HTML: has actual HTML tags (not just stray < chars)
  const htmlTagPattern = /<(div|p|h[1-6]|ul|ol|li|table|tr|td|th|span|a|img|section|article|header|footer|main|nav|blockquote|pre|code|br|hr|strong|em|b|i)\b[^>]*>/i
  if (htmlTagPattern.test(content)) {
    // Count HTML tags vs total length to avoid false positives
    const tagCount = (content.match(/<[a-z][a-z0-9]*[\s>]/gi) || []).length
    if (tagCount >= 3) return 'html'
  }

  // Markdown: has heading markers, lists, code blocks, tables
  const mdSignals = [
    /^#{1,6}\s+/m,           // headings
    /^\s*[-*]\s+/m,          // unordered lists
    /^\s*\d+\.\s+/m,        // ordered lists
    /^```/m,                 // code fences
    /\|.*\|.*\|/m,          // tables
    /\*\*[^*]+\*\*/,        // bold
    /\[.+?\]\(.+?\)/,       // links
  ]
  let mdScore = 0
  for (const sig of mdSignals) {
    if (sig.test(content)) mdScore++
  }
  if (mdScore >= 2) return 'markdown'

  // Single markdown signal + longer content → still markdown
  if (mdScore >= 1 && content.length > 500) return 'markdown'

  return 'plain'
}

// ── Slug helper ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
}

// ── Main Component ───────────────────────────────────────────────────────────

export function KBContentRenderer({ content, itemType }: Props) {
  if (!content) return null

  const format = useMemo(() => detectFormat(content, itemType), [content, itemType])

  switch (format) {
    case 'html':
      return <HTMLRenderer content={content} />
    case 'chat':
      return <ChatRenderer content={content} />
    case 'markdown':
      return <MarkdownRenderer text={content} />
    case 'plain':
    default:
      return <MarkdownRenderer text={content} />
  }
}

// ── HTML Renderer ────────────────────────────────────────────────────────────

function HTMLRenderer({ content }: { content: string }) {
  // Strip script tags and event handlers for safety
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')

  return (
    <div
      className="kb-html-content kb-prose"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

// ── Chat Renderer ────────────────────────────────────────────────────────────

function ChatRenderer({ content }: { content: string }) {
  const messages = useMemo(() => parseChatMessages(content), [content])

  // If we have a title line at the top, extract it
  const firstLine = content.split('\n')[0]?.trim()
  const hasTitle = firstLine?.startsWith('Title:')
  const title = hasTitle ? firstLine.replace(/^Title:\s*/, '') : null

  // Extract just the assistant content for article-style rendering
  const assistantContent = messages
    .filter(m => m.role === 'assistant')
    .map(m => stripAIArtifacts(m.text))
    .filter(t => t.length > 20)
    .join('\n\n---\n\n')

  if (assistantContent.length > 200) {
    // Render as article with the substantive content
    return (
      <div>
        {title && (
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1">
              <span>💬</span> Extracted from ChatGPT conversation
            </div>
          </div>
        )}
        <MarkdownRenderer text={assistantContent} />
      </div>
    )
  }

  // Short conversations: show as chat bubbles
  return (
    <div className="kb-chat-thread space-y-4">
      {title && (
        <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-3 py-1">
            <span>💬</span> ChatGPT Conversation
          </div>
        </div>
      )}
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`kb-chat-message flex gap-3 ${
            msg.role === 'user' ? 'justify-end' : ''
          }`}
        >
          {msg.role !== 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AI
            </div>
          )}
          <div
            className={`rounded-2xl px-4 py-3 max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-amber-500 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md border border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              <InlineRenderer text={stripAIArtifacts(msg.text)} />
            </div>
          </div>
          {msg.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              U
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function parseChatMessages(content: string): { role: 'user' | 'assistant' | 'system'; text: string }[] {
  const lines = content.split('\n')
  const messages: { role: 'user' | 'assistant' | 'system'; text: string }[] = []
  let currentRole: 'user' | 'assistant' | 'system' | null = null
  let currentLines: string[] = []

  for (const line of lines) {
    // Skip title lines
    if (line.trim().startsWith('Title:')) continue

    const roleMatch = line.match(/^(assistant|user|system|human|ai)\s*:\s*(.*)/i)
    if (roleMatch) {
      // Save previous message
      if (currentRole && currentLines.length > 0) {
        messages.push({ role: currentRole, text: currentLines.join('\n').trim() })
      }
      // Normalize role
      const rawRole = roleMatch[1].toLowerCase()
      currentRole = rawRole === 'human' ? 'user' : rawRole === 'ai' ? 'assistant' : rawRole as any
      currentLines = roleMatch[2] ? [roleMatch[2]] : []
    } else if (currentRole) {
      currentLines.push(line)
    }
  }
  // Last message
  if (currentRole && currentLines.length > 0) {
    messages.push({ role: currentRole, text: currentLines.join('\n').trim() })
  }

  return messages
}

// ── Markdown Renderer ────────────────────────────────────────────────────────

function MarkdownRenderer({ text }: { text: string }) {
  const cleaned = useMemo(() => stripAIArtifacts(text), [text])
  const blocks = useMemo(() => parseBlocks(cleaned), [cleaned])
  const toc = useMemo(() => extractToc(blocks), [blocks])
  const showToc = toc.length >= 3

  return (
    <div className="kb-md-content kb-prose">
      {showToc && <TableOfContents entries={toc} />}
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  )
}

// ── Table of Contents ────────────────────────────────────────────────────────

function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const minLevel = Math.min(...entries.map(e => e.level))

  return (
    <nav className="kb-toc mb-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 p-5 not-prose">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        On this page
      </h2>
      <ul className="space-y-1">
        {entries.map((entry, i) => (
          <li
            key={i}
            style={{ paddingLeft: `${(entry.level - minLevel) * 16}px` }}
          >
            <a
              href={`#${entry.id}`}
              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-0.5 leading-relaxed"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function extractToc(blocks: Block[]): TocEntry[] {
  return blocks
    .filter((b): b is Extract<Block, { type: 'heading' }> => b.type === 'heading' && b.level <= 3)
    .map(b => ({ id: b.id, text: b.text.replace(/\*\*/g, ''), level: b.level }))
}

// ── Block Parser ─────────────────────────────────────────────────────────────

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0
  let headingCount = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (trimmed === '') { i++; continue }

    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      headingCount++
      const headingText = headingMatch[2].replace(/\s*#+$/, '') // Remove trailing #s
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingText,
        id: slugify(headingText) || `heading-${headingCount}`,
      })
      i++
      continue
    }

    // Callout blockquotes: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
    if (/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i.test(trimmed)) {
      const variantMatch = trimmed.match(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i)
      const variant = (variantMatch?.[1]?.toLowerCase() || 'note') as Block extends { type: 'callout' } ? Block['variant'] : never
      const calloutLines: string[] = []
      // First line might have content after the marker
      const firstLineContent = trimmed.replace(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '')
      if (firstLineContent) calloutLines.push(firstLineContent)
      i++
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        calloutLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'callout', variant: variant as any, text: calloutLines.join('\n') })
      continue
    }

    // Regular blockquote
    if (trimmed.startsWith('> ') || trimmed === '>') {
      const quoteLines: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('> ') || lines[i].trim() === '>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') })
      continue
    }

    // Table: lines with pipes
    if (/^\|?.+\|.+\|?$/.test(trimmed) && i + 1 < lines.length && /^\|?[\s\-:|]+\|/.test(lines[i + 1]?.trim())) {
      const tableLines: string[] = []
      while (i < lines.length && /^\|?.+\|/.test(lines[i]?.trim())) {
        tableLines.push(lines[i].trim())
        i++
      }
      if (tableLines.length >= 2) {
        const parseRow = (line: string): string[] =>
          line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim())
        const headers = parseRow(tableLines[0])
        // Skip separator row (index 1)
        const rows = tableLines.slice(2).map(parseRow)
        blocks.push({ type: 'table', headers, rows })
        continue
      }
    }

    // Image: ![alt](src)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgMatch) {
      blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] })
      i++
      continue
    }

    // Unordered list
    if (/^[-*+]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*[-*+]\s/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // Ordered list
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[\s]*\d+[.)]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*\d+[.)]\s*/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Regular paragraph
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^[-*+]\s/.test(lines[i].trim()) &&
      !/^\d+[.)]\s/.test(lines[i].trim()) &&
      !/^\|?.+\|.+\|?$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      const joined = paraLines.join('\n')
      blocks.push({ type: 'paragraph', text: joined })
    }
  }

  return blocks
}

// ── Block Renderer ───────────────────────────────────────────────────────────

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      const classes: Record<number, string> = {
        1: 'text-3xl font-extrabold mt-12 mb-4 text-gray-900 dark:text-gray-50 tracking-tight leading-tight scroll-mt-20',
        2: 'text-2xl font-bold mt-10 mb-3 text-gray-900 dark:text-gray-50 tracking-tight pb-3 border-b border-gray-200 dark:border-gray-800 leading-snug scroll-mt-20',
        3: 'text-xl font-semibold mt-8 mb-2 text-gray-900 dark:text-gray-100 leading-snug scroll-mt-20',
        4: 'text-lg font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200 scroll-mt-20',
        5: 'text-base font-semibold mt-5 mb-1.5 text-gray-800 dark:text-gray-200',
        6: 'text-sm font-semibold mt-4 mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider',
      }
      return <Tag key={key} id={block.id} className={classes[block.level] || classes[3]}><InlineRenderer text={block.text} /></Tag>
    }

    case 'paragraph':
      return (
        <p key={key} className="text-gray-700 dark:text-gray-300 leading-7 my-4">
          <InlineRenderer text={block.text} />
        </p>
      )

    case 'code':
      return (
        <div key={key} className="kb-code-block my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
          {block.lang && (
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span>{block.lang}</span>
              <button
                onClick={() => navigator.clipboard?.writeText(block.code)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          )}
          <pre className="bg-gray-950 dark:bg-gray-900 p-5 overflow-x-auto">
            <code className="text-sm text-gray-100 dark:text-gray-200 font-mono leading-6">
              {block.code}
            </code>
          </pre>
        </div>
      )

    case 'blockquote':
      return (
        <blockquote key={key} className="my-6 border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 pl-5 pr-4 py-3 rounded-r-lg">
          <div className="text-gray-600 dark:text-gray-400 italic leading-7">
            <InlineRenderer text={block.text} />
          </div>
        </blockquote>
      )

    case 'callout':
      return <CalloutBox key={key} variant={block.variant} text={block.text} />

    case 'hr':
      return <hr key={key} className="my-10 border-gray-200 dark:border-gray-800" />

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      const listClass = block.ordered
        ? 'list-decimal ml-6 my-4 space-y-2'
        : 'list-disc ml-6 my-4 space-y-2'
      return (
        <Tag key={key} className={listClass}>
          {block.items.map((item, j) => (
            <li key={j} className="text-gray-700 dark:text-gray-300 leading-7 pl-1">
              <InlineRenderer text={item} />
            </li>
          ))}
        </Tag>
      )
    }

    case 'table':
      return (
        <div key={key} className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80">
                {block.headers.map((header, j) => (
                  <th key={j} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    <InlineRenderer text={header} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {block.rows.map((row, j) => (
                <tr key={j} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  {row.map((cell, k) => (
                    <td key={k} className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <InlineRenderer text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'image':
      return (
        <figure key={key} className="my-8">
          <img
            src={block.src}
            alt={block.alt}
            className="rounded-xl border border-gray-200 dark:border-gray-700 max-w-full h-auto shadow-sm"
            loading="lazy"
          />
          {block.alt && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {block.alt}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

// ── Callout Box ──────────────────────────────────────────────────────────────

const CALLOUT_CONFIG = {
  note: {
    icon: 'ℹ️',
    label: 'Note',
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50/60 dark:bg-blue-900/15',
    title: 'text-blue-800 dark:text-blue-300',
    text: 'text-blue-700 dark:text-blue-400',
  },
  tip: {
    icon: '💡',
    label: 'Tip',
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/60 dark:bg-emerald-900/15',
    title: 'text-emerald-800 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    icon: '⚠️',
    label: 'Warning',
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/60 dark:bg-amber-900/15',
    title: 'text-amber-800 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
  },
  important: {
    icon: '🔔',
    label: 'Important',
    border: 'border-violet-300 dark:border-violet-700',
    bg: 'bg-violet-50/60 dark:bg-violet-900/15',
    title: 'text-violet-800 dark:text-violet-300',
    text: 'text-violet-700 dark:text-violet-400',
  },
  caution: {
    icon: '🚨',
    label: 'Caution',
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50/60 dark:bg-red-900/15',
    title: 'text-red-800 dark:text-red-300',
    text: 'text-red-700 dark:text-red-400',
  },
}

function CalloutBox({ variant, text }: { variant: keyof typeof CALLOUT_CONFIG; text: string }) {
  const config = CALLOUT_CONFIG[variant] || CALLOUT_CONFIG.note
  return (
    <div className={`my-6 rounded-xl border ${config.border} ${config.bg} p-5`}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${config.title} mb-2`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </div>
      <div className={`text-sm ${config.text} leading-relaxed`}>
        <InlineRenderer text={text} />
      </div>
    </div>
  )
}

// ── Inline Renderer ──────────────────────────────────────────────────────────

function InlineRenderer({ text }: { text: string }): React.ReactElement {
  const parts = useMemo(() => renderInlineParts(text), [text])
  return <>{parts}</>
}

function renderInlineParts(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index === 0) {
      parts.push(<strong key={key++} className="font-semibold text-gray-900 dark:text-gray-100">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Link with image: [![alt](img)](url) — show as linked image
    const linkedImgMatch = remaining.match(/^\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/)
    if (linkedImgMatch && linkedImgMatch.index === 0) {
      parts.push(
        <a key={key++} href={linkedImgMatch[3]} target="_blank" rel="noopener noreferrer" className="inline-block">
          <img src={linkedImgMatch[2]} alt={linkedImgMatch[1]} className="rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 inline" loading="lazy" />
        </a>
      )
      remaining = remaining.slice(linkedImgMatch[0].length)
      continue
    }

    // Inline image: ![alt](url)
    const inlineImgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (inlineImgMatch && inlineImgMatch.index === 0) {
      parts.push(
        <img key={key++} src={inlineImgMatch[2]} alt={inlineImgMatch[1]} className="inline rounded-lg border border-gray-200 dark:border-gray-700 max-h-48" loading="lazy" />
      )
      remaining = remaining.slice(inlineImgMatch[0].length)
      continue
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch && linkMatch.index === 0) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-amber-600 dark:text-amber-400 underline underline-offset-2 decoration-amber-300/50 dark:decoration-amber-700/50 hover:decoration-amber-500 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch && codeMatch.index === 0) {
      parts.push(
        <code key={key++} className="rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.875em] font-mono text-violet-600 dark:text-violet-400 border border-gray-200 dark:border-gray-700">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Italic: *text* (only single *)
    if (remaining[0] === '*' && remaining[1] !== '*') {
      const italicMatch = remaining.match(/^\*([^*]+)\*/)
      if (italicMatch && italicMatch.index === 0) {
        parts.push(<em key={key++} className="text-gray-600 dark:text-gray-400">{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }
    }

    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch && strikeMatch.index === 0) {
      parts.push(<del key={key++} className="text-gray-400">{strikeMatch[1]}</del>)
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    // Bare URL: https://... or http://...
    const urlMatch = remaining.match(/^(https?:\/\/[^\s<>\])"]+)/)
    if (urlMatch && urlMatch.index === 0) {
      const url = urlMatch[1].replace(/[.,;:!?)]+$/, '') // trim trailing punctuation
      parts.push(
        <a
          key={key++}
          href={url}
          className="text-amber-600 dark:text-amber-400 underline underline-offset-2 decoration-amber-300/50 hover:decoration-amber-500 transition-colors break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          {url.length > 60 ? url.substring(0, 57) + '…' : url}
        </a>
      )
      remaining = remaining.slice(url.length)
      continue
    }

    // Line break
    if (remaining[0] === '\n') {
      parts.push(<br key={key++} />)
      remaining = remaining.slice(1)
      continue
    }

    // Plain text: consume until next special character
    const nextSpecial = remaining.slice(1).search(/[\*`\[~!\n]|https?:\/\//)
    if (nextSpecial === -1) {
      parts.push(remaining)
      remaining = ''
    } else {
      parts.push(remaining.slice(0, nextSpecial + 1))
      remaining = remaining.slice(nextSpecial + 1)
    }
  }

  return parts
}
