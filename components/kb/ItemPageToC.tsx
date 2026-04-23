'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'

interface TOCHeading {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * ItemPageToC — renders a Table of Contents in the right sidebar area
 * by scanning the DOM for headings within .kb-content-area
 * Falls back to parsing the raw content string for headings
 */
export function ItemPageToC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TOCHeading[]>([])
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Extract headings from rendered DOM (more reliable) or from content string
  useEffect(() => {
    // Wait for content to render
    const timer = setTimeout(() => {
      const extracted: TOCHeading[] = []

      // Try to find headings in the rendered content area
      const contentArea = document.querySelector('.kb-content-area, .kb-html-content, .kb-prose, article')
      if (contentArea) {
        const domHeadings = contentArea.querySelectorAll('h1, h2, h3, h4')
        domHeadings.forEach((el, index) => {
          const text = el.textContent?.trim() || ''
          if (!text) return

          // Ensure heading has an ID for scroll targeting
          if (!el.id) {
            el.id = slugify(text) || `heading-${index}`
          }

          extracted.push({
            id: el.id,
            text,
            level: parseInt(el.tagName.charAt(1)),
          })
        })
      }

      // If no DOM headings found, parse from content string
      if (extracted.length === 0 && content) {
        // HTML headings
        const htmlRegex = /<h([1-4])[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h[1-4]>/gi
        let match
        while ((match = htmlRegex.exec(content)) !== null) {
          const text = match[3].replace(/<[^>]+>/g, '').trim()
          if (text) {
            extracted.push({
              id: match[2] || slugify(text),
              text,
              level: parseInt(match[1]),
            })
          }
        }

        // Markdown headings
        if (extracted.length === 0) {
          const mdRegex = /^(#{1,4})\s+(.+)$/gm
          while ((match = mdRegex.exec(content)) !== null) {
            const text = match[2].replace(/\*\*|__|\*|_|`/g, '').trim()
            if (text) {
              extracted.push({
                id: slugify(text),
                text,
                level: match[1].length,
              })
            }
          }
        }
      }

      setHeadings(extracted)
    }, 500) // Give content time to render

    return () => clearTimeout(timer)
  }, [content])

  // Intersection observer for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  if (headings.length < 2) return null

  const minLevel = Math.min(...headings.map(h => h.level))

  return (
    <>
      {/* Inline ToC (shown below article on smaller screens) */}
      <div className="xl:hidden mt-8 mb-4">
        <details className="group">
          <summary className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Table of Contents ({headings.length})
          </summary>
          <nav className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-800">
            <ul className="space-y-0.5 py-1">
              {headings.map((h, i) => (
                <li key={`${h.id}-${i}`}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className="w-full text-left text-xs py-1 px-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                    style={{ paddingLeft: `${8 + (h.level - minLevel) * 12}px` }}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </div>

      {/* Right panel ToC (rendered via a portal-like mechanism into the sidebar) */}
      <div className="hidden" data-kb-toc="true" data-headings={JSON.stringify(headings)}>
        {/* This hidden element is read by the layout to populate the right sidebar */}
      </div>

      {/* Sticky right-panel ToC (only rendered on xl+ via the layout's aside) */}
      <div id="kb-toc-portal" className="hidden xl:block fixed-toc-container">
        <div className="sticky top-6">
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              On this page
            </span>
          </div>

          <ul className="space-y-0.5">
            {headings.map((h, i) => (
              <li key={`toc-${h.id}-${i}`}>
                <button
                  onClick={() => scrollTo(h.id)}
                  className={`
                    w-full text-left text-[11px] py-1 px-2 rounded-md transition-all duration-150 leading-relaxed
                    ${activeId === h.id
                      ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/15 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/40'}
                  `}
                  style={{ paddingLeft: `${8 + (h.level - minLevel) * 12}px` }}
                >
                  <span className="line-clamp-2">{h.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
