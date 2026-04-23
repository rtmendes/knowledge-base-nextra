'use client'

import React, { useMemo } from 'react'

interface Props {
  content: string
  isHtml: boolean
  itemType?: string
}

// ── AI Chat Artifact Patterns ────────────────────────────────────────────
const UI_CHROME_PATTERNS = [
  /^(Create Web Page|View|Click to open|Edit in AI Developer|Using Tool|Image Generation)\s*$/gm,
  /^\|?\s*(Image Generation|Web Search|Code Execution)\s*\|?\s*$/gm,
  /^Tab \d+\s*$/gm,
  /^Mixture-of-Agents\s*$/gm,
  /^(gpt-5|gpt-4o?|claude-3|claude-\d|gemini-\d|deepseek-\w+)\s*$/gmi,
  /^(agentic_\w+|Click to open)\s*$/gm,
]

function cleanContent(text: string): string {
  let cleaned = text
  for (const pattern of UI_CHROME_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')
  return cleaned.trim()
}

// ── Detect content type ──────────────────────────────────────────────────
function detectContentFormat(content: string): 'chat' | 'markdown' | 'plain' {
  const lines = content.split('\n').slice(0, 30)
  const chatLineCount = lines.filter(l => /^(User|Assistant|Human|AI|System)\s*[:>]/i.test(l.trim())).length
  if (chatLineCount >= 3) return 'chat'
  const mdIndicators = lines.filter(l =>
    /^#{1,6}\s/.test(l.trim()) ||
    /^\*\*[^*]+\*\*/.test(l.trim()) ||
    /^[-*]\s/.test(l.trim()) ||
    /^\d+\.\s/.test(l.trim()) ||
    /^```/.test(l.trim()) ||
    /^\|.+\|/.test(l.trim())
  ).length
  if (mdIndicators >= 3) return 'markdown'
  return 'plain'
}

// ── Table of Contents ────────────────────────────────────────────────────
interface TocEntry { id: string; level: number; text: string }

function extractToc(content: string, isHtml: boolean): TocEntry[] {
  const entries: TocEntry[] = []
  if (isHtml) {
    const re = /<h([1-3])[^>]*>([^<]+)<\/h\1>/gi
    let match
    while ((match = re.exec(content)) !== null) {
      const id = match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      entries.push({ id, level: parseInt(match[1]), text: match[2].trim() })
    }
  } else {
    const lines = content.split('\n')
    for (const line of lines) {
      const m = line.match(/^(#{1,3})\s+(.+)/)
      if (m) {
        const text = m[2].replace(/\*\*/g, '').trim()
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        entries.push({ id, level: m[1].length, text })
      }
    }
  }
  return entries
}

function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 3) return null
  return (
    <nav className="kb-toc mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 p-5 backdrop-blur-sm">
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        On This Page
      </h4>
      <ul className="space-y-1">
        {entries.map((e, i) => (
          <li key={i} style={{ paddingLeft: `${(e.level - 1) * 16}px` }}>
            <a
              href={`#${e.id}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-relaxed block py-0.5"
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ── Chat Renderer ────────────────────────────────────────────────────────
function ChatRenderer({ text }: { text: string }) {
  const messages: { role: string; content: string }[] = []
  const lines = text.split('\n')
  let currentRole = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const m = line.match(/^(User|Assistant|Human|AI|System)\s*[:>]\s*(.*)/i)
    if (m) {
      if (currentRole) {
        messages.push({ role: currentRole, content: currentContent.join('\n').trim() })
      }
      currentRole = m[1].toLowerCase()
      currentContent = m[2] ? [m[2]] : []
    } else if (currentRole) {
      currentContent.push(line)
    }
  }
  if (currentRole) {
    messages.push({ role: currentRole, content: currentContent.join('\n').trim() })
  }

  if (messages.length === 0) return <MarkdownRenderer text={text} />

  return (
    <div className="space-y-4">
      {messages.map((msg, i) => {
        const isUser = ['user', 'human'].includes(msg.role)
        return (
          <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
              isUser
                ? 'bg-amber-500/10 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800/50'
                : 'bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700'
            }`}>
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                isUser ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {isUser ? '👤 You' : '🤖 Assistant'}
              </div>
              <div className="text-gray-700 dark:text-gray-300 leading-7 text-sm">
                <MarkdownRenderer text={msg.content} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────
export function KBContentRenderer({ content, isHtml, itemType }: Props) {
  if (!content) return null

  const cleaned = useMemo(() => cleanContent(content), [content])
  const toc = useMemo(() => extractToc(cleaned, isHtml), [cleaned, isHtml])
  const format = useMemo(() => isHtml ? 'html' : detectContentFormat(cleaned), [cleaned, isHtml])
  const showToc = toc.length >= 3 && cleaned.length > 2000

  if (isHtml) {
    let htmlWithIds = cleaned
    const re = /<h([1-6])([^>]*)>([^<]+)<\/h\1>/gi
    htmlWithIds = htmlWithIds.replace(re, (_match, level, attrs, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      if (attrs.includes('id=')) return _match
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`
    })

    return (
      <>
        {showToc && <TableOfContents entries={toc} />}
        <div className="kb-html-content" dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
      </>
    )
  }

  if (format === 'chat') {
    return (
      <>
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 px-4 py-2.5">
          <span className="text-blue-500">💬</span>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">This item contains a conversation transcript</span>
        </div>
        <ChatRenderer text={cleaned} />
      </>
    )
  }

  return (
    <>
      {showToc && <TableOfContents entries={toc} />}
      <MarkdownRenderer text={cleaned} />
    </>
  )
}

// ── Markdown Renderer ──────────────────────────────────────────────────────

function MarkdownRenderer({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text])
  return <div className="kb-md-content">{blocks.map((block, i) => renderBlock(block, i))}</div>
}

type Block =
  | { type: 'heading'; level: number; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'callout'; kind: 'info' | 'warning' | 'tip' | 'note'; text: string }
  | { type: 'hr' }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'empty' }

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

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
      i++
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lines.length && /^\|[\s:-]+\|/.test(lines[i + 1]?.trim())) {
      const headers = trimmed.split('|').filter(c => c.trim()).map(c => c.trim())
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].split('|').filter(c => c.trim()).map(c => c.trim()))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const hText = headingMatch[2]
      const id = hText.replace(/\*\*/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: hText, id })
      i++
      continue
    }

    // Blockquote / Callout
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      const joined = quoteLines.join('\n')
      if (/^[ℹ️📘🔵]/.test(joined)) {
        blocks.push({ type: 'callout', kind: 'info', text: joined.replace(/^[ℹ️📘🔵]\s*/, '') })
      } else if (/^[⚠️🔶🟡]/.test(joined)) {
        blocks.push({ type: 'callout', kind: 'warning', text: joined.replace(/^[⚠️🔶🟡]\s*/, '') })
      } else if (/^[💡✨🟢]/.test(joined)) {
        blocks.push({ type: 'callout', kind: 'tip', text: joined.replace(/^[💡✨🟢]\s*/, '') })
      } else if (/^[📝📋]/.test(joined)) {
        blocks.push({ type: 'callout', kind: 'note', text: joined.replace(/^[📝📋]\s*/, '') })
      } else {
        blocks.push({ type: 'blockquote', text: joined })
      }
      continue
    }

    // Unordered list
    if (/^[\-\*]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[\s]*[\-\*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*[\-\*]\s/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[\s]*\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[\s]*\d+\.\s*/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // Paragraph
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^[\-\*]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|'))
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      const joined = paraLines.join('\n')
      if (joined.length > 800) {
        const sentences = joined.split(/(?<=[.!?])\s+(?=[A-Z])/)
        let current: string[] = []
        for (const s of sentences) {
          current.push(s)
          if (current.join(' ').length > 500) {
            blocks.push({ type: 'paragraph', text: current.join(' ') })
            current = []
          }
        }
        if (current.length) blocks.push({ type: 'paragraph', text: current.join(' ') })
      } else {
        blocks.push({ type: 'paragraph', text: joined })
      }
    }
  }

  return blocks
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      const classes: Record<number, string> = {
        1: 'text-3xl font-extrabold mt-12 mb-5 text-gray-900 dark:text-gray-50 tracking-tight leading-tight',
        2: 'text-2xl font-bold mt-10 mb-4 text-gray-900 dark:text-gray-50 tracking-tight pb-3 border-b border-gray-200 dark:border-gray-800 leading-snug',
        3: 'text-xl font-semibold mt-8 mb-3 text-gray-900 dark:text-gray-100 leading-snug',
        4: 'text-lg font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200',
        5: 'text-base font-semibold mt-5 mb-1.5 text-gray-800 dark:text-gray-200',
        6: 'text-sm font-semibold mt-4 mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider',
      }
      return <Tag key={key} id={block.id} className={classes[block.level] || classes[3]}>{renderInline(block.text)}</Tag>
    }

    case 'paragraph':
      return (
        <p key={key} className="text-gray-700 dark:text-gray-300 leading-7 my-4 max-w-prose">
          {renderInline(block.text)}
        </p>
      )

    case 'code':
      return (
        <div key={key} className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          {block.lang && (
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="ml-2">{block.lang}</span>
            </div>
          )}
          <pre className="bg-gray-950 dark:bg-gray-900 p-5 overflow-x-auto">
            <code className="text-sm text-gray-100 dark:text-gray-200 font-mono leading-6">{block.code}</code>
          </pre>
        </div>
      )

    case 'blockquote':
      return (
        <blockquote key={key} className="my-6 border-l-4 border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-800/40 pl-5 pr-4 py-3 rounded-r-lg">
          <p className="text-gray-600 dark:text-gray-400 italic leading-7">{renderInline(block.text)}</p>
        </blockquote>
      )

    case 'callout': {
      const styles = {
        info: { border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50/80 dark:bg-blue-900/15', icon: 'ℹ️', label: 'Info', text: 'text-blue-800 dark:text-blue-300' },
        warning: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50/80 dark:bg-amber-900/15', icon: '⚠️', label: 'Warning', text: 'text-amber-800 dark:text-amber-300' },
        tip: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50/80 dark:bg-emerald-900/15', icon: '💡', label: 'Tip', text: 'text-emerald-800 dark:text-emerald-300' },
        note: { border: 'border-violet-200 dark:border-violet-800', bg: 'bg-violet-50/80 dark:bg-violet-900/15', icon: '📝', label: 'Note', text: 'text-violet-800 dark:text-violet-300' },
      }
      const s = styles[block.kind]
      return (
        <div key={key} className={`my-6 rounded-xl border ${s.border} ${s.bg} p-5`}>
          <div className={`text-xs font-bold uppercase tracking-widest ${s.text} mb-2 flex items-center gap-1.5`}>
            <span>{s.icon}</span> {s.label}
          </div>
          <div className={`text-sm ${s.text} leading-relaxed`}>{renderInline(block.text)}</div>
        </div>
      )
    }

    case 'table':
      return (
        <div key={key} className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80">
                {block.headers.map((h, j) => (
                  <th key={j} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {block.rows.map((row, j) => (
                <tr key={j} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  {row.map((cell, k) => (
                    <td key={k} className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'hr':
      return <hr key={key} className="my-10 border-gray-200 dark:border-gray-800" />

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      const listClass = block.ordered ? 'list-decimal ml-6 my-4 space-y-2' : 'list-disc ml-6 my-4 space-y-2'
      return (
        <Tag key={key} className={listClass}>
          {block.items.map((item, j) => (
            <li key={j} className="text-gray-700 dark:text-gray-300 leading-7 pl-1.5">{renderInline(item)}</li>
          ))}
        </Tag>
      )
    }

    default:
      return null
  }
}

// ── Inline Rendering ──────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index === 0) {
      parts.push(<strong key={key++} className="font-semibold text-gray-900 dark:text-gray-100">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/)
    if (linkMatch && linkMatch.index === 0) {
      parts.push(
        <a key={key++} href={linkMatch[2]}
          className="text-amber-600 dark:text-amber-400 underline underline-offset-2 decoration-amber-300/50 dark:decoration-amber-700/50 hover:decoration-amber-500 transition-colors font-medium"
          target="_blank" rel="noopener noreferrer">{linkMatch[1]}</a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    const codeMatch = remaining.match(/^`(.+?)`/)
    if (codeMatch && codeMatch.index === 0) {
      parts.push(
        <code key={key++} className="rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.875em] font-mono text-violet-600 dark:text-violet-400 border border-gray-200 dark:border-gray-700">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch && italicMatch.index === 0 && !boldMatch) {
      parts.push(<em key={key++} className="text-gray-600 dark:text-gray-400">{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch && strikeMatch.index === 0) {
      parts.push(<del key={key++} className="text-gray-400">{strikeMatch[1]}</del>)
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    const nextSpecial = remaining.slice(1).search(/[\*`\[~]/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      remaining = ''
    } else {
      parts.push(remaining.slice(0, nextSpecial + 1))
      remaining = remaining.slice(nextSpecial + 1)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}
