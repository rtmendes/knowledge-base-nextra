'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

function extractHeadings(content: string): TOCItem[] {
  const headings: TOCItem[] = []

  // Extract from HTML headings
  const htmlRegex = /<h([1-4])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h[1-4]>/gi
  let match
  while ((match = htmlRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const id = match[2] || ''
    const text = match[3].replace(/<[^>]+>/g, '').trim()
    if (text && level <= 4) {
      headings.push({
        id: id || slugify(text),
        text,
        level,
      })
    }
  }

  // If no HTML headings, try markdown
  if (headings.length === 0) {
    const mdRegex = /^(#{1,4})\s+(.+)$/gm
    while ((match = mdRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].replace(/\*\*|__|\*|_|`/g, '').trim()
      if (text) {
        headings.push({
          id: slugify(text),
          text,
          level,
        })
      }
    }
  }

  return headings
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content])

  // Intersection observer to track active heading
  useEffect(() => {
    if (headings.length === 0) return

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first visible heading
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    })

    // Observe all heading elements
    headings.forEach(heading => {
      const el = document.getElementById(heading.id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings])

  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  if (headings.length < 2) return null

  // Find the minimum heading level to normalize indentation
  const minLevel = Math.min(...headings.map(h => h.level))

  return (
    <nav className={`kb-toc ${className || ''}`}>
      <div className="flex items-center gap-1.5 mb-3">
        <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          On this page
        </span>
      </div>

      <ul className="space-y-0.5">
        {headings.map((heading, i) => {
          const indent = heading.level - minLevel
          const isActive = activeId === heading.id

          return (
            <li key={`${heading.id}-${i}`}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`
                  w-full text-left text-xs py-1 px-2 rounded-md transition-all duration-150
                  ${isActive
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/15 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40'}
                `}
                style={{ paddingLeft: `${8 + indent * 12}px` }}
              >
                <span className="line-clamp-2 leading-relaxed">{heading.text}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
