'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  item_count: number
  parent_category_id?: string | null
}

interface SidebarItem {
  id: string
  title: string
  slug: string
  item_type: string
  category_id: string
  parent_id?: string | null
  updated_at?: string
}

interface KBSidebarProps {
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onCreateItem?: () => void
  onCreateCategory?: () => void
  onTagsPanel?: () => void
  selectionMode: boolean
  selectedIds: Set<string>
  onToggleSelection: (id: string) => void
  onToggleSelectionMode: () => void
}

// ── Icon Map ──────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, string> = {
  brain: '🧠', robot: '🤖', code: '💻', book: '📖', chart: '📊',
  rocket: '🚀', lightbulb: '💡', globe: '🌐', shield: '🛡️', star: '⭐',
  zap: '⚡', target: '🎯', puzzle: '🧩', palette: '🎨', megaphone: '📢',
  users: '👥', database: '🗄️', cloud: '☁️', lock: '🔒', gift: '🎁',
  film: '🎬', music: '🎵', camera: '📷', mail: '📧', search: '🔍',
  settings: '⚙️', flag: '🏁', heart: '❤️', fire: '🔥', trophy: '🏆',
  'fas fa-robot': '🤖', 'fas fa-cogs': '⚙️', 'fas fa-plane': '✈️',
  'fas fa-gem': '💎', 'fas fa-chart-line': '📈', 'fas fa-bullhorn': '📢',
  'fas fa-graduation-cap': '🎓', 'fas fa-pray': '🙏', 'fas fa-heartbeat': '💪',
  'fas fa-utensils': '🍽️', 'fas fa-folder': '📁', 'fas fa-book': '📚',
  'fas fa-star': '⭐', 'fas fa-music': '🎵', 'fas fa-newspaper': '📰',
  'fas fa-users': '👨‍👩‍👧‍👦', 'fas fa-dollar-sign': '💰', 'fas fa-store': '🏪',
  'fas fa-home': '🏠', 'fas fa-flask': '🔬', 'fas fa-search': '🔍',
  'fas fa-code': '💻', 'fas fa-server': '🖥️', 'fas fa-video': '🎬',
  'fas fa-heart': '❤️', 'fas fa-play-circle': '▶️',
  'fas fa-rocket': '🚀',
  youtube: '📺', 'fas fa-youtube': '📺',
}

function getCatIcon(icon: string): string {
  return ICON_MAP[icon] || icon || '📁'
}

// ── Sidebar Component ─────────────────────────────────────────────────────

export function KBSidebar({
  categories, isOpen, onClose, onCreateItem, onCreateCategory, onTagsPanel,
  selectionMode, selectedIds, onToggleSelection, onToggleSelectionMode,
}: KBSidebarProps) {
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryItems, setCategoryItems] = useState<Record<string, SidebarItem[]>>({})
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set())
  const [recentItems, setRecentItems] = useState<SidebarItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sidebarFilter, setSidebarFilter] = useState('')
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [dragOverParent, setDragOverParent] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Load recent items and favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kb-recent-items')
      if (stored) setRecentItems(JSON.parse(stored))
      const favs = localStorage.getItem('kb-favorites')
      if (favs) setFavorites(new Set(JSON.parse(favs)))
    } catch {}
  }, [])

  // Auto-expand the active category
  useEffect(() => {
    const catMatch = pathname.match(/^\/kb\/([^/]+)$/)
    if (catMatch && catMatch[1] !== 'item') {
      const slug = catMatch[1]
      const cat = categories.find(c => c.slug === slug)
      if (cat) {
        setExpandedCategories(prev => new Set([...prev, cat.id]))
        loadCategoryItems(cat.id)
      }
    }
  }, [pathname, categories])

  // Load items for a category
  const loadCategoryItems = useCallback(async (categoryId: string) => {
    if (categoryItems[categoryId] || loadingCategories.has(categoryId)) return

    setLoadingCategories(prev => new Set([...prev, categoryId]))
    try {
      const res = await fetch(`/api/kb/items?category_id=${categoryId}&limit=200`)
      if (res.ok) {
        const data = await res.json()
        setCategoryItems(prev => ({ ...prev, [categoryId]: data.items || [] }))
      }
    } catch {}
    setLoadingCategories(prev => {
      const next = new Set(prev)
      next.delete(categoryId)
      return next
    })
  }, [categoryItems, loadingCategories])

  const toggleCategory = useCallback((catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(catId)) {
        next.delete(catId)
      } else {
        next.add(catId)
        loadCategoryItems(catId)
      }
      return next
    })
  }, [loadCategoryItems])

  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      localStorage.setItem('kb-favorites', JSON.stringify([...next]))
      return next
    })
  }, [])

  // ── Drag & Drop ───────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string, itemTitle: string) => {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.setData('application/kb-item-id', itemId)
    e.dataTransfer.effectAllowed = 'move'
    // If in selection mode and this item is selected, drag all selected
    if (selectionMode && selectedIds.has(itemId)) {
      e.dataTransfer.setData('application/kb-item-ids', JSON.stringify([...selectedIds]))
    }
  }, [selectionMode, selectedIds])

  const handleDragOverCategory = useCallback((e: React.DragEvent, catId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCategory(catId)
  }, [])

  const handleDragOverItem = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverParent(itemId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverCategory(null)
    setDragOverParent(null)
  }, [])

  const handleDropOnCategory = useCallback(async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    setDragOverCategory(null)

    // Get item IDs
    const bulkIds = e.dataTransfer.getData('application/kb-item-ids')
    const singleId = e.dataTransfer.getData('application/kb-item-id')
    const itemIds = bulkIds ? JSON.parse(bulkIds) : singleId ? [singleId] : []

    if (itemIds.length === 0) return

    try {
      if (itemIds.length === 1) {
        await fetch(`/api/kb/items/${itemIds[0]}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_id: targetCategoryId }),
        })
      } else {
        await fetch('/api/kb/items/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'move', item_ids: itemIds, category_id: targetCategoryId }),
        })
      }
      // Refresh items for affected categories
      setCategoryItems(prev => {
        const next = { ...prev }
        // Remove moved items from old categories
        for (const catId of Object.keys(next)) {
          next[catId] = next[catId].filter(i => !itemIds.includes(i.id))
        }
        // We'll need to reload the target category
        delete next[targetCategoryId]
        return next
      })
      loadCategoryItems(targetCategoryId)
    } catch (err) {
      console.error('Move failed:', err)
    }
  }, [loadCategoryItems])

  const handleDropOnItem = useCallback(async (e: React.DragEvent, parentItemId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverParent(null)

    const singleId = e.dataTransfer.getData('application/kb-item-id')
    if (!singleId || singleId === parentItemId) return

    try {
      await fetch(`/api/kb/items/${singleId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentItemId }),
      })
      // Refresh
      for (const catId of Object.keys(categoryItems)) {
        const items = categoryItems[catId]
        if (items?.some(i => i.id === singleId)) {
          setCategoryItems(prev => {
            const next = { ...prev }
            next[catId] = next[catId].map(i =>
              i.id === singleId ? { ...i, parent_id: parentItemId } : i
            )
            return next
          })
          break
        }
      }
      setExpandedItems(prev => new Set([...prev, parentItemId]))
    } catch (err) {
      console.error('Set parent failed:', err)
    }
  }, [categoryItems])

  // Build nested hierarchy for category items
  const getNestedItems = useCallback((catId: string, filter: string) => {
    const items = categoryItems[catId] || []
    const filtered = filter
      ? items.filter(item => item.title.toLowerCase().includes(filter.toLowerCase()))
      : items

    // Build parent-child map
    const rootItems = filtered.filter(i => !i.parent_id || !filtered.some(p => p.id === i.parent_id))
    const childMap: Record<string, SidebarItem[]> = {}
    for (const item of filtered) {
      if (item.parent_id && filtered.some(p => p.id === item.parent_id)) {
        if (!childMap[item.parent_id]) childMap[item.parent_id] = []
        childMap[item.parent_id].push(item)
      }
    }

    return { rootItems, childMap }
  }, [categoryItems])

  // Build category tree with parent_category_id
  const categoryTree = useMemo(() => {
    const rootCats = categories.filter(c => c.item_count > 0 && !c.parent_category_id)
    const childCatMap: Record<string, Category[]> = {}
    for (const c of categories) {
      if (c.parent_category_id && c.item_count > 0) {
        if (!childCatMap[c.parent_category_id]) childCatMap[c.parent_category_id] = []
        childCatMap[c.parent_category_id].push(c)
      }
    }
    return { rootCats, childCatMap }
  }, [categories])

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!sidebarFilter) return categoryTree.rootCats
    const q = sidebarFilter.toLowerCase()
    return categories.filter(c =>
      c.item_count > 0 && (
        c.name.toLowerCase().includes(q) ||
        (categoryItems[c.id] || []).some(item => item.title.toLowerCase().includes(q))
      )
    )
  }, [categories, sidebarFilter, categoryItems, categoryTree.rootCats])

  // Check if an item is active
  const isItemActive = (itemId: string) => pathname === `/kb/item/${itemId}`
  const isCategoryActive = (slug: string) => pathname === `/kb/${slug}`

  // ── Render a single item row ──────────────────────────────────────────

  const renderItem = (item: SidebarItem, childMap: Record<string, SidebarItem[]>, depth: number = 0) => {
    const hasChildren = (childMap[item.id] || []).length > 0
    const isExpanded = expandedItems.has(item.id)

    return (
      <div key={item.id}>
        <div
          draggable={!selectionMode}
          onDragStart={(e) => handleDragStart(e, item.id, item.title)}
          onDragOver={(e) => handleDragOverItem(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnItem(e, item.id)}
          className={`
            group/item flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all cursor-pointer
            ${depth > 0 ? 'ml-3 pl-3 border-l border-gray-200 dark:border-gray-800' : ''}
            ${dragOverParent === item.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400' : ''}
            ${isItemActive(item.id)
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-gray-200'}
          `}
        >
          {/* Selection checkbox */}
          {selectionMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelection(item.id) }}
              className="flex-shrink-0"
            >
              <div className={`w-3.5 h-3.5 rounded border-2 transition-colors flex items-center justify-center ${selectedIds.has(item.id) ? 'bg-amber-500 border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {selectedIds.has(item.id) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>
            </button>
          )}

          {/* Expand children toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpandedItems(prev => {
                  const next = new Set(prev)
                  if (next.has(item.id)) next.delete(item.id)
                  else next.add(item.id)
                  return next
                })
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className={`w-2.5 h-2.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0 mx-1" />
          )}

          {/* Item link */}
          <Link
            href={`/kb/item/${item.id}`}
            className="truncate flex-1"
            onClick={(e) => { if (selectionMode) { e.preventDefault(); onToggleSelection(item.id) } }}
          >
            {item.title}
          </Link>

          {/* Favorite toggle */}
          {!selectionMode && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.id) }}
              className={`flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 ${favorites.has(item.id) ? 'opacity-100 text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
              title={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-3 h-3" fill={favorites.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
        </div>

        {/* Children (nested sub-pages) */}
        {hasChildren && isExpanded && (
          <div className="ml-1">
            {childMap[item.id].map(child => renderItem(child, childMap, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // ── Render a category row ─────────────────────────────────────────────

  const renderCategory = (cat: Category, depth: number = 0) => {
    const isExpanded = expandedCategories.has(cat.id)
    const isActive = isCategoryActive(cat.slug)
    const isLoading = loadingCategories.has(cat.id)
    const icon = getCatIcon(cat.icon)
    const childCats = categoryTree.childCatMap[cat.id] || []
    const { rootItems, childMap } = getNestedItems(cat.id, sidebarFilter)

    return (
      <div key={cat.id} className="mb-0.5">
        {/* Category Row */}
        <div
          onDragOver={(e) => handleDragOverCategory(e, cat.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnCategory(e, cat.id)}
          className={`
            flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-all
            ${depth > 0 ? 'ml-3' : ''}
            ${dragOverCategory === cat.id ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400 ring-inset scale-[1.01]' : ''}
            ${isActive
              ? 'bg-amber-50 dark:bg-amber-900/15 text-amber-800 dark:text-amber-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/60'}
          `}
        >
          {/* Expand/collapse chevron */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id) }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Category link */}
          <Link
            href={`/kb/${cat.slug}`}
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => { if (!isExpanded) toggleCategory(cat.id) }}
          >
            <span className="text-sm flex-shrink-0">{icon}</span>
            <span className="text-xs font-medium truncate">{cat.name}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {cat.item_count}
            </span>
          </Link>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="ml-5 pl-2.5 border-l border-gray-200 dark:border-gray-800 mt-0.5 mb-1">
            {/* Child categories */}
            {childCats.map(cc => renderCategory(cc, depth + 1))}

            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-3 h-3 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-[10px] text-gray-400">Loading…</span>
              </div>
            )}

            {!isLoading && rootItems.length === 0 && (
              <div className="px-2 py-1.5 text-[10px] text-gray-400 dark:text-gray-600 italic">
                No items yet
              </div>
            )}

            {rootItems.map(item => renderItem(item, childMap))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-white dark:bg-gray-950
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-200 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/kb"
              className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <span className="text-lg">📚</span>
              <span>Knowledge Base</span>
            </Link>
            <div className="flex items-center gap-0.5">
              {/* Selection mode toggle */}
              <button
                onClick={onToggleSelectionMode}
                className={`p-1.5 rounded-lg transition-colors ${selectionMode ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title={selectionMode ? 'Exit selection mode' : 'Select multiple items'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              {onCreateCategory && (
                <button
                  onClick={onCreateCategory}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  title="New category"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </button>
              )}
              {onCreateItem && (
                <button
                  onClick={onCreateItem}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  title="New page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              placeholder="Filter pages…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-1 focus:ring-amber-400/30 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 kb-sidebar-scroll">
          {/* Recent Items */}
          {recentItems.length > 0 && !sidebarFilter && !selectionMode && (
            <div className="px-3 mb-3">
              <button className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-1.5 w-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent
              </button>
              {recentItems.slice(0, 5).map(item => (
                <Link
                  key={item.id}
                  href={`/kb/item/${item.id}`}
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors
                    ${isItemActive(item.id)
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'}
                  `}
                >
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Category Tree */}
          <div className="px-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                Categories
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums">
                {categories.filter(c => c.item_count > 0).length}
              </span>
            </div>

            {filteredCategories.map(cat => renderCategory(cat))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-600">
            <button
              onClick={onTagsPanel}
              className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Tags
            </button>
            <span>{categories.reduce((sum, c) => sum + c.item_count, 0).toLocaleString()} items</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </aside>
    </>
  )
}
