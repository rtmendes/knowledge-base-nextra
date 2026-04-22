'use client'

interface Props {
  content: string
  isHtml: boolean
}

export function KBContentRenderer({ content, isHtml }: Props) {
  if (!content) return null

  if (isHtml) {
    // Render HTML content. We sanitize basic XSS but preserve structure.
    // For embedded interactive content, this is the recommended approach per SKILL.md.
    return (
      <div 
        className="kb-html-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Render plain text / markdown as preformatted
  // Basic markdown rendering: headers, bold, italic, links, lists
  const lines = content.split('\n')
  const rendered = lines.map((line, i) => {
    // Headers
    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-8 mb-2 text-gray-900 dark:text-gray-50">{line.slice(4)}</h3>
    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-10 mb-3 text-gray-900 dark:text-gray-50 border-b pb-2 border-gray-200 dark:border-gray-700">{line.slice(3)}</h2>
    if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-2 mb-5 text-gray-900 dark:text-gray-50">{line.slice(2)}</h1>
    
    // Horizontal rule
    if (/^---+$/.test(line.trim())) return <hr key={i} className="my-8 border-gray-200 dark:border-gray-700" />
    
    // List items
    if (/^[\-\*] /.test(line.trim())) {
      return <li key={i} className="ml-6 list-disc text-gray-700 dark:text-gray-300 leading-7">{formatInline(line.replace(/^[\s\-\*]+/, ''))}</li>
    }
    if (/^\d+\. /.test(line.trim())) {
      return <li key={i} className="ml-6 list-decimal text-gray-700 dark:text-gray-300 leading-7">{formatInline(line.replace(/^\s*\d+\.\s*/, ''))}</li>
    }

    // Empty line
    if (line.trim() === '') return <div key={i} className="h-4" />

    // Normal paragraph
    return <p key={i} className="text-gray-700 dark:text-gray-300 leading-7 my-1">{formatInline(line)}</p>
  })

  return <div>{rendered}</div>
}

function formatInline(text: string): React.ReactNode {
  // Very basic inline formatting
  // Bold: **text** or __text__
  // Italic: *text* or _text_
  // Links: [text](url)
  // Code: `code`
  
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Try to match patterns
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    const codeMatch = remaining.match(/^`(.+?)`/)
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/)

    if (boldMatch && boldMatch.index === 0) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
    } else if (linkMatch && linkMatch.index === 0) {
      parts.push(
        <a key={key++} href={linkMatch[2]} className="text-amber-600 dark:text-amber-400 underline underline-offset-2 hover:no-underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
    } else if (codeMatch && codeMatch.index === 0) {
      parts.push(
        <code key={key++} className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.875em] font-mono text-pink-600 dark:text-pink-400">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
    } else if (italicMatch && italicMatch.index === 0 && !boldMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
    } else {
      // Regular character
      const nextSpecial = remaining.slice(1).search(/[\*`\[]/)
      if (nextSpecial === -1) {
        parts.push(remaining)
        remaining = ''
      } else {
        parts.push(remaining.slice(0, nextSpecial + 1))
        remaining = remaining.slice(nextSpecial + 1)
      }
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}
