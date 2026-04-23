'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { KBSidebar } from './KBSidebar'
import { CommandPalette } from './CommandPalette'
import { CreateItemModal } from './CreateItemModal'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  item_count: number
}

interface KBWorkspaceLayoutProps {
  categories: Category[]
  children: React.ReactNode
  rightPanel?: React.ReactNode
}

export function KBWorkspaceLayout({ categories, children, rightPanel }: KBWorkspaceLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Open sidebar by default on desktop
  const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true)

  // Global ⌘K handler
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleCreateItem = useCallback(() => {
    setCreateModalOpen(true)
  }, [])

  const isItemPage = pathname.startsWith('/kb/item/')

  return (
    <div className="kb-workspace-layout flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar */}
      <div className={`flex-shrink-0 ${sidebarDesktopOpen ? 'hidden lg:block' : 'hidden'}`}>
        <KBSidebar
          categories={categories}
          isOpen={true}
          onClose={() => setSidebarDesktopOpen(false)}
          onCreateItem={handleCreateItem}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <KBSidebar
          categories={categories}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCreateItem={handleCreateItem}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          {/* Sidebar toggle */}
          <button
            onClick={() => {
              // Desktop: toggle persistent sidebar
              // Mobile: toggle overlay sidebar
              if (window.innerWidth >= 1024) {
                setSidebarDesktopOpen(prev => !prev)
              } else {
                setSidebarOpen(prev => !prev)
              }
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Quick search button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 flex-1 max-w-sm px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-500 dark:hover:text-gray-400 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search pages…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-auto px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono text-gray-400">
              ⌘K
            </kbd>
          </button>

          {/* Create button */}
          <button
            onClick={handleCreateItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Page</span>
          </button>
        </div>

        {/* Content + Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto kb-main-scroll">
            {children}
          </main>

          {/* Right Panel (ToC) - only on item pages on large screens */}
          {isItemPage && rightPanel && (
            <aside className="hidden xl:block flex-shrink-0 w-56 border-l border-gray-100 dark:border-gray-800 overflow-y-auto py-6 px-4">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCreateItem={handleCreateItem}
      />

      {/* Create Item Modal */}
      <CreateItemModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        categories={categories}
      />
    </div>
  )
}
