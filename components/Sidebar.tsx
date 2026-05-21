'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavCategory {
  name: string
  icon: string
  href: string
  children?: { name: string; href: string }[]
}

const NAV_CATEGORIES: NavCategory[] = [
  { name: 'Home', icon: '🏠', href: '/' },
  { name: 'Knowledge Base', icon: '📚', href: '/kb' },
  { name: 'AI Research', icon: '🧠', href: '/ai-research' },
  { name: 'Genspark Projects', icon: '⚡', href: '/genspark' },
  { name: 'Interactive Tools', icon: '🔧', href: '/interactive' },
  { name: 'SOPs', icon: '📋', href: '/sops' },
  { name: 'Architecture', icon: '🏗️', href: '/architecture' },
  { name: 'Agents', icon: '🤖', href: '/agents' },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5">
          <Link href="/" className="flex items-center gap-2 mb-8" onClick={() => setIsOpen(false)}>
            <span className="text-lg font-bold tracking-tight">InsightProfit KB</span>
          </Link>

          <nav className="space-y-1">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
            <a
              href="/keystatic"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ✏️ Admin Editor
            </a>
          </div>
        </div>
      </aside>
    </>
  )
}
