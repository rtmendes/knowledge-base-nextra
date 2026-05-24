'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { KBSidebar } from './KBSidebar'
import { CommandPalette } from './CommandPalette'
import { CreateItemModal } from './CreateItemModal'
import { CreateCategoryModal } from './CreateCategoryModal'
import { BulkOperationsBar } from './BulkOperationsBar'
import { TagsPanel } from './TagsPanel'
import { ResizablePanelGroup } from './ResizablePanels'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  item_count: number
  parent_category_id?: string | null
}

interface KBWorkspaceLayoutProps {
  categories: Category[]
  children: React.ReactNode
  rightPanel?: React.ReactNode
}

export function KBWorkspaceLayout({ categories: initialCategories, children, rightPanel }: KBWorkspaceLayoutProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  // Track mount state so we don't render the wrong icon during SSR
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [categories, setCategories] = useState(initialCategories)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [tagsPanelOpen, setTagsPanelOpen] = useState(false)

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Open sidebar by default on desktop
  const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true)

  // Sync categories if they change from server
  useEffect(() => { setCategories(initialCategories) }, [initialCategories])

  // Global ⌘K handler
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
      // Escape to exit selection mode
      if (e.key === 'Escape' && selectionMode) {
        setSelectionMode(false)
        setSelectedIds(new Set())
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [selectionMode])

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleCreateItem = useCallback(() => {
    setCreateModalOpen(true)
  }, [])

  const handleCreateCategory = useCallback(() => {
    setCreateCategoryOpen(true)
  }, [])

  const handleCategoryCreated = useCallback((newCategory: any) => {
    setCategories(prev => [...prev, { ...newCategory, item_count: newCategory.item_count || 0 }])
  }, [])

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      if (prev) setSelectedIds(new Set()) // Clear selection when exiting
      return !prev
    })
  }, [])

  const handleBulkComplete = useCallback(() => {
    // Force a page refresh to update counts
    window.location.reload()
  }, [])

  const isItemPage = pathname.startsWith('/kb/item/')

  // Sidebar component (shared between desktop resizable + mobile overlay)
  const sidebarContent = (
    <KBSidebar
      categories={categories}
      isOpen={true}
      onClose={() => setSidebarDesktopOpen(false)}
      onCreateItem={handleCreateItem}
      onCreateCategory={handleCreateCategory}
      onTagsPanel={() => setTagsPanelOpen(true)}
      selectionMode={selectionMode}
      selectedIds={selectedIds}
      onToggleSelection={handleToggleSelection}
      onToggleSelectionMode={handleToggleSelectionMode}
    />
  )

  return (
    <div className="kb-workspace-layout flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile Sidebar (overlay) */}
      <div className="lg:hidden">
        <KBSidebar
          categories={categories}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCreateItem={handleCreateItem}
          onCreateCategory={handleCreateCategory}
          onTagsPanel={() => setTagsPanelOpen(true)}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelection={handleToggleSelection}
          onToggleSelectionMode={handleToggleSelectionMode}
        />
      </div>

      {/* Resizable three-panel layout */}
      <ResizablePanelGroup
        sidebar={sidebarContent}
        sidebarVisible={sidebarDesktopOpen}
        rightPanel={isItemPage ? rightPanel : undefined}
        rightPanelVisible={isItemPage && !!rightPanel}
      >
        {/* Toolbar + Main Content (center panel) */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          {/* Sidebar toggle */}
          <button
            onClick={() => {
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

          {/* Tags button */}
          <button
            onClick={() => setTagsPanelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Tags"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            <span className="hidden sm:inline">Tags</span>
          </button>

          {/* Selection mode toggle */}
          <button
            onClick={handleToggleSelectionMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${selectionMode ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            title={selectionMode ? 'Exit bulk select' : 'Bulk select'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden sm:inline">{selectionMode ? `${selectedIds.size} selected` : 'Select'}</span>
          </button>

          {/* Dark / light mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? (
                /* Sun icon — visible in dark mode, click to go light */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                /* Moon icon — visible in light mode, click to go dark */
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

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

        {/* Scrollable content area — no max-width cap so it fills available space */}
        <main className="flex-1 overflow-y-auto kb-main-scroll">
          {children}
        </main>
      </ResizablePanelGroup>

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

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onCreated={handleCategoryCreated}
      />

      {/* Tags Panel */}
      <TagsPanel
        isOpen={tagsPanelOpen}
        onClose={() => setTagsPanelOpen(false)}
      />

      {/* Bulk Operations Bar */}
      <BulkOperationsBar
        selectedIds={selectedIds}
        categories={categories}
        onClearSelection={() => { setSelectedIds(new Set()); setSelectionMode(false) }}
        onOperationComplete={handleBulkComplete}
      />
    </div>
  )
}
