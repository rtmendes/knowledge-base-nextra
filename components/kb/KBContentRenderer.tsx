'use client'

import React from 'react'

interface Props {
  content: string
  isHtml: boolean
}

export function KBContentRenderer({ content, isHtml }: Props) {
  if (!content) return null

  if (isHtml) {
    return (
      <div
        className="kb-html-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // ── Markdown-like rendering ────────────────────────────────────────────
  return <MarkdownRenderer text={content} />
}

// ── Markdown Renderer ──────────────────────────────────────────────────────

function MarkdownRenderer({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  return <div className="kb-md-content">{blocks.map((block, i) => renderBlock(block, i))}</div>
}

// Block types
type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'empty' }

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Empty line
    if (trimmed === '') {
      i++
      continue
    }

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
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      i++
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') })
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

    // Regular paragraph: collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^[\-\*]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paraLines.join('\n') })
    }
  }

  return blocks
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      const classes: Record<number, string> = {
        1: 'text-3xl font-extrabold mt-10 mb-4 text-gray-900 dark:text-gray-50 tracking-tight leading-tight',
        2: 'text-2xl font-bold mt-10 mb-3 text-gray-900 dark:text-gray-50 tracking-tight pb-3 border-b border-gray-200 dark:border-gray-800 leading-snug',
        3: 'text-xl font-semibold mt-8 mb-2 text-gray-900 dark:text-gray-100 leading-snug',
        4: 'text-lg font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-200',
        5: 'text-base font-semibold mt-5 mb-1.5 text-gray-800 dark:text-gray-200',
        6: 'text-sm font-semibold mt-4 mb-1 text-gray-700 dark:text-gray-300 uppercase tracking-wider',
      }
      return <Tag key={key} className={classes[block.level] || classes[3]}>{renderInline(block.text)}</Tag>
    }

    case 'paragraph':
      return (
        <p key={key} className="text-gray-700 dark:text-gray-300 leading-7 my-4">
          {renderInline(block.text)}
        </p>
      )

    case 'code':
      return (
        <div key={key} className="my-6 rounded-xl overflow-hidden border border-gray-800 dark:border-gray-700">
          {block.lang && (
            <div className="bg-gray-800 dark:bg-gray-800 px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500 font-mono border-b border-gray-700">
              {block.lang}
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
        <blockquote key={key} className="my-6 border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 pl-5 pr-4 py-3 rounded-r-lg">
          <p className="text-gray-600 dark:text-gray-400 italic leading-7">
            {renderInline(block.text)}
          </p>
        </blockquote>
      )

    case 'hr':
      return <hr key={key} className="my-10 border-gray-200 dark:border-gray-800" />

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      const listClass = block.ordered
        ? 'list-decimal ml-6 my-4 space-y-1.5'
        : 'list-disc ml-6 my-4 space-y-1.5'
      return (
        <Tag key={key} className={listClass}>
          {block.items.map((item, j) => (
            <li key={j} className="text-gray-700 dark:text-gray-300 leading-7 pl-1">
              {renderInline(item)}
            </li>
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
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch && boldMatch.index === 0) {
      parts.push(<strong key={key++} className="font-semibold text-gray-900 dark:text-gray-100">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/)
    if (linkMatch && linkMatch.index === 0) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          className="text-amber-600 dark:text-amber-400 underline underline-offset-2 decoration-amber-300 dark:decoration-amber-700 hover:decoration-amber-500 transition-colors"
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

    // Italic: *text* (only if not bold)
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch && italicMatch.index === 0 && !boldMatch) {
      parts.push(<em key={key++} className="text-gray-600 dark:text-gray-400">{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch && strikeMatch.index === 0) {
      parts.push(<del key={key++} className="text-gray-400">{strikeMatch[1]}</del>)
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    // Plain text: consume until next special character
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
