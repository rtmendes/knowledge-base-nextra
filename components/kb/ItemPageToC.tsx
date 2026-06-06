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

// Single-word structural labels that appear as headings in AI-generated content
// (e.g. "## user", "### assistant", "## type") but carry no navigational value
const NOISE_HEADING_WORDS = new Set([
  'user', 'assistant', 'system', 'admin', 'role', 'type', 'id', 'name',
  'api', 'get', 'set', 'post', 'put', 'delete', 'patch', 'data', 'text',
  'note', 'tip', 'info', 'warning', 'error', 'output', 'input', 'result',
  'response', 'request', 'content', 'message', 'example', 'sample',
])

function isNoisyHeading(text: string): boolean {
  const trimmed = text.trim()
  // Skip very short headings (single chars, empty after trim)
  if (trimmed.length < 3) return true
  // Skip single-word structural labels
  const words = trimmed.split(/\s+/)
  if (words.length === 1 && NOISE_HEADING_WORDS.has(words[0].toLowerCase())) return true
  return false
}

export function ItemPageToC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TOCHeading[]>([])
  const [activeId, setActiveId] = useState('')
  const [open, setOpen] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const extracted: TOCHeading[] = []
      // Prefer the scoped data attribute added to the article in page.tsx;
      // fall back to well-known class names and finally the generic article tag.
      const contentArea = document.querySelector(
        '[data-kb-content], .kb-content-area, .kb-html-content, .kb-prose, article'
      )
      if (contentArea) {
        contentArea.querySelectorAll('h1, h2, h3, h4').forEach((el, index) => {
          const text = el.textContent?.trim() || ''
          if (!text || isNoisyHeading(text)) return
          if (!el.id) el.id = slugify(text) || `heading-${index}`
          extracted.push({ id: el.id, text, level: parseInt(el.tagName.charAt(1)) })
        })
      }
      if (extracted.length === 0 && content) {
        for (const match of content.matchAll(/<h([1-4])[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h[1-4]>/gi)) {
          const text = match[3].replace(/<[^>]+>/g, '').trim()
          if (text && !isNoisyHeading(text)) {
            extracted.push({ id: match[2] || slugify(text), text, level: parseInt(match[1]) })
          }
        }
        if (extracted.length === 0) {
          for (const match of content.matchAll(/^(#{1,4})\s+(.+)$/gm)) {
            const text = match[2].replace(/\*\*|__|\*|_|`/g, '').trim()
            if (text && !isNoisyHeading(text)) {
              extracted.push({ id: slugify(text), text, level: match[1].length })
            }
          }
        }
      }
      setHeadings(extracted)
    }, 600)
    return () => clearTimeout(timer)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) setActiveId(visible[0].target.id)
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
      {/* Mobile inline collapsible TOC */}
      <div className="xl:hidden mt-8 mb-4">
        <details className="group">
          <summary className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            On This Page ({headings.length})
          </summary>
          <nav className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-gray-800">
            <ul className="space-y-0.5 py-1">
              {headings.map((h, i) => (
                <li key={`mob-${h.id}-${i}`}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`w-full text-left text-xs py-1 px-2 rounded-md transition-colors ${activeId === h.id ? 'text-amber-700 dark:text-amber-300 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'}`}
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

      {/* Desktop: fixed floating widget */}
      <div className="hidden xl:flex flex-col items-end fixed right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          {open ? (
            <div className="w-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">On This Page</span>
                  <span className="text-[9px] font-bold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 leading-tight">{headings.length}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  title="Collapse"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <nav className="max-h-[55vh] overflow-y-auto kb-sidebar-scroll py-2 px-1">
                <ul className="space-y-0.5">
                  {headings.map((h, i) => (
                    <li key={`toc-${h.id}-${i}`}>
                      <button
                        onClick={() => scrollTo(h.id)}
                        className={`w-full text-left text-[11px] py-1.5 rounded-lg transition-all leading-snug ${activeId === h.id ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                        style={{ paddingLeft: `${10 + (h.level - minLevel) * 10}px`, paddingRight: '8px' }}
                      >
                        <span className="line-clamp-2">{h.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Back to top
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
              title="Show table of contents"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Contents
            </button>
          )}
        </div>
      </div>
    </>
  )
}
