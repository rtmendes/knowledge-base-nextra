'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors,
  closestCenter, type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { flattenTree, moveSubtree, deriveUpdates, diffUpdates } from '../../lib/kb-tree'

// ── Types ─────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  item_count: number
  parent_category_id?: string | null
  sort_order?: number
}

interface SidebarItem {
  id: string
  title: string
  slug: string
  item_type: string
  category_id: string
  parent_id?: string | null
  tags?: string[]
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
  onCategoryUpdate?: (cat: Category) => void
  onCategoryDelete?: (catId: string) => void
}

interface ContextMenu {
  x: number
  y: number
  catId: string
  catName: string
}

interface ItemContextMenu {
  x: number
  y: number
  itemId: string
  itemTitle: string
  catId: string
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

// ── dnd-kit sortable wrapper (render-prop, so renderCategory keeps its closures) ──
function SortableCat({ id, children }: { id: string; children: (p: {
  setNodeRef: (el: HTMLElement | null) => void
  attributes: any
  listeners: any
  style: React.CSSProperties
  isDragging: boolean
}) => React.ReactNode }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return <>{children({ setNodeRef, attributes, listeners, style, isDragging })}</>
}

// ── Sidebar Component ─────────────────────────────────────────────────────

export function KBSidebar({
  categories: categoriesProp,
  isOpen, onClose, onCreateItem, onCreateCategory, onTagsPanel,
  selectionMode, selectedIds, onToggleSelection, onToggleSelectionMode,
  onCategoryUpdate, onCategoryDelete,
}: KBSidebarProps) {
  const pathname = usePathname()

  // ── Core state ──────────────────────────────────────────────────────────
  const [categories, setCategories] = useState(categoriesProp)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryItems, setCategoryItems] = useState<Record<string, SidebarItem[]>>({})
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set())
  const [recentItems, setRecentItems] = useState<SidebarItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sidebarFilter, setSidebarFilter] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // ── Drag state ──────────────────────────────────────────────────────────
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [dragOverParent, setDragOverParent] = useState<string | null>(null)
  const [draggingCatId, setDraggingCatId] = useState<string | null>(null)

  // ── Inline rename ───────────────────────────────────────────────────────
  const [renamingCatId, setRenamingCatId] = useState<string | null>(null)
  const [renamingCatValue, setRenamingCatValue] = useState('')
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)
  const [renamingItemValue, setRenamingItemValue] = useState('')
  const [renamingItemCatId, setRenamingItemCatId] = useState<string | null>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  // ── Context menu ────────────────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [itemContextMenu, setItemContextMenu] = useState<ItemContextMenu | null>(null)
  const [moveMenuOpen, setMoveMenuOpen] = useState(false)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const itemContextMenuRef = useRef<HTMLDivElement>(null)

  // ── Root-level drop zone ────────────────────────────────────────────────
  const [dragOverRoot, setDragOverRoot] = useState(false)
  const [showEmpty, setShowEmpty] = useState(true)

  // Sync categories from prop
  useEffect(() => { setCategories(categoriesProp) }, [categoriesProp])

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

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const close = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [contextMenu])

  // Close item context menu on outside click
  useEffect(() => {
    if (!itemContextMenu) return
    const close = (e: MouseEvent) => {
      if (itemContextMenuRef.current && !itemContextMenuRef.current.contains(e.target as Node)) {
        setItemContextMenu(null)
        setMoveMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [itemContextMenu])

  // Focus rename input when it appears
  useEffect(() => {
    if ((renamingCatId || renamingItemId) && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingCatId, renamingItemId])

  // ── Load items ───────────────────────────────────────────────────────────

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

  // ── Inline rename ────────────────────────────────────────────────────────

  const startRenameCategory = useCallback((catId: string, name: string) => {
    setContextMenu(null)
    setRenamingCatId(catId)
    setRenamingCatValue(name)
  }, [])

  const saveRenameCategory = useCallback(async (catId: string) => {
    const name = renamingCatValue.trim()
    setRenamingCatId(null)
    if (!name) return
    try {
      const res = await fetch(`/api/kb/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: updated.name, slug: updated.slug } : c))
        onCategoryUpdate?.(updated)
      }
    } catch {}
  }, [renamingCatValue, onCategoryUpdate])

  const startRenameItem = useCallback((itemId: string, title: string, catId: string) => {
    setRenamingItemId(itemId)
    setRenamingItemValue(title)
    setRenamingItemCatId(catId)
  }, [])

  const saveRenameItem = useCallback(async (itemId: string) => {
    const title = renamingItemValue.trim()
    const catId = renamingItemCatId
    setRenamingItemId(null)
    setRenamingItemCatId(null)
    if (!title || !catId) return
    try {
      await fetch(`/api/kb/items/${itemId}/update-meta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      setCategoryItems(prev => ({
        ...prev,
        [catId]: (prev[catId] || []).map(i => i.id === itemId ? { ...i, title } : i),
      }))
    } catch {}
  }, [renamingItemValue, renamingItemCatId])

  // ── Delete category ───────────────────────────────────────────────────────

  const handleDeleteCategory = useCallback(async (catId: string) => {
    setContextMenu(null)
    if (!confirm('Delete this category? Items will move to Uncategorized.')) return
    try {
      const res = await fetch(`/api/kb/categories/${catId}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== catId))
        onCategoryDelete?.(catId)
      }
    } catch {}
  }, [onCategoryDelete])

  // ── Item delete / move via context menu ──────────────────────────────────

  const handleDeleteItem = useCallback(async (itemId: string, catId: string) => {
    setItemContextMenu(null)
    setMoveMenuOpen(false)
    if (!confirm('Delete this page? This cannot be undone.')) return
    try {
      const res = await fetch('/api/kb/items/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', item_ids: [itemId] }),
      })
      if (res.ok) {
        setCategoryItems(prev => ({
          ...prev,
          [catId]: (prev[catId] || []).filter(i => i.id !== itemId),
        }))
        // Decrement parent category count
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, item_count: Math.max(0, c.item_count - 1) } : c))
      }
    } catch {}
  }, [])

  const handleMoveItemToCategory = useCallback(async (itemId: string, fromCatId: string, toCatId: string) => {
    setItemContextMenu(null)
    setMoveMenuOpen(false)
    if (fromCatId === toCatId) return
    try {
      const res = await fetch(`/api/kb/items/${itemId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: toCatId, parent_id: null }),
      })
      if (res.ok) {
        // Optimistic: remove from old, invalidate new so it reloads
        setCategoryItems(prev => {
          const next = { ...prev }
          next[fromCatId] = (next[fromCatId] || []).filter(i => i.id !== itemId)
          delete next[toCatId]
          return next
        })
        setCategories(prev => prev.map(c => {
          if (c.id === fromCatId) return { ...c, item_count: Math.max(0, c.item_count - 1) }
          if (c.id === toCatId) return { ...c, item_count: c.item_count + 1 }
          return c
        }))
        if (expandedCategories.has(toCatId)) loadCategoryItems(toCatId)
      }
    } catch {}
  }, [expandedCategories, loadCategoryItems])

  // ── Root-level drop (un-nest category) ────────────────────────────────────

  const handleDropOnRoot = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverRoot(false)
    const catId = e.dataTransfer.getData('application/kb-cat-id')
    if (!catId) return
    try {
      const res = await fetch(`/api/kb/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_category_id: null }),
      })
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, parent_category_id: null } : c))
        const updated = await res.json()
        onCategoryUpdate?.(updated)
      }
    } catch {}
  }, [onCategoryUpdate])

  // ── New sub-category ─────────────────────────────────────────────────────

  const handleNewSubCategory = useCallback(async (parentCatId: string) => {
    setContextMenu(null)
    const name = prompt('Sub-folder name:')
    if (!name?.trim()) return
    try {
      const res = await fetch('/api/kb/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          icon: 'fas fa-folder',
          color: '#6366f1',
          parent_category_id: parentCatId,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories(prev => [...prev, { ...created, item_count: 0 }])
        setExpandedCategories(prev => new Set([...prev, parentCatId]))
      }
    } catch {}
  }, [])

  // ── Item Drag & Drop ─────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.setData('application/kb-item-id', itemId)
    e.dataTransfer.effectAllowed = 'move'
    if (selectionMode && selectedIds.has(itemId)) {
      e.dataTransfer.setData('application/kb-item-ids', JSON.stringify([...selectedIds]))
    }
  }, [selectionMode, selectedIds])

  const handleDragOverCategory = useCallback((e: React.DragEvent, catId: string) => {
    // Only for item drops, not category-to-category reparenting
    if (draggingCatId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCategory(catId)
  }, [draggingCatId])

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

    // Category reparent takes priority
    const catId = e.dataTransfer.getData('application/kb-cat-id')
    if (catId && catId !== targetCategoryId) {
      try {
        const res = await fetch(`/api/kb/categories/${catId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parent_category_id: targetCategoryId }),
        })
        if (res.ok) {
          const updated = await res.json()
          setCategories(prev => prev.map(c => c.id === catId ? { ...c, parent_category_id: targetCategoryId } : c))
          onCategoryUpdate?.(updated)
        }
      } catch {}
      return
    }

    // Otherwise move items
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
      setCategoryItems(prev => {
        const next = { ...prev }
        for (const cId of Object.keys(next)) {
          next[cId] = next[cId].filter(i => !itemIds.includes(i.id))
        }
        delete next[targetCategoryId]
        return next
      })
      loadCategoryItems(targetCategoryId)
    } catch (err) {
      console.error('Move failed:', err)
    }
  }, [loadCategoryItems, onCategoryUpdate, draggingCatId])

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

  // ── Category Drag ─ now handled by dnd-kit (see handleCatDragEndDnd) ──────────
  // Native category-drag handlers were removed; `draggingCatId` stays null and its
  // old root-drop zone is inert. Category reorder/nest now persists via the engine.

  // ── Nested hierarchy helpers ─────────────────────────────────────────────

  const getNestedItems = useCallback((catId: string, filter: string) => {
    const items = categoryItems[catId] || []
    const filtered = filter
      ? items.filter(item => item.title.toLowerCase().includes(filter.toLowerCase()))
      : items

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

  // Show ALL categories — empty ones still need to be visible and editable.
  // `showEmpty` toggle in the footer lets the user hide empty ones if they prefer.
  const categoryTree = useMemo(() => {
    const visible = (c: Category) => showEmpty || c.item_count > 0
    const rootCats = categories.filter(c => !c.parent_category_id && visible(c))
    const childCatMap: Record<string, Category[]> = {}
    for (const c of categories) {
      if (c.parent_category_id && visible(c)) {
        if (!childCatMap[c.parent_category_id]) childCatMap[c.parent_category_id] = []
        childCatMap[c.parent_category_id].push(c)
      }
    }
    return { rootCats, childCatMap }
  }, [categories, showEmpty])

  const filteredCategories = useMemo(() => {
    if (!sidebarFilter) return categoryTree.rootCats
    const q = sidebarFilter.toLowerCase()
    return categories.filter(c =>
      !c.parent_category_id && (
        c.name.toLowerCase().includes(q) ||
        (categoryItems[c.id] || []).some(item => item.title.toLowerCase().includes(q))
      )
    )
  }, [categories, sidebarFilter, categoryItems, categoryTree.rootCats])

  // Flat list of categories for the "Move to…" submenu
  const allCategoriesFlat = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

  // ── dnd-kit category tree drag (Notion-style: subtree travels, persists to DB) ──
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const dndEnabled = !sidebarFilter

  // Visible categories in the SAME DFS order they render (roots → expanded children).
  const visibleCatIds = useMemo(() => {
    const ids: string[] = []
    const walk = (cat: Category) => {
      ids.push(cat.id)
      if (expandedCategories.has(cat.id)) {
        for (const cc of (categoryTree.childCatMap[cat.id] || [])) walk(cc)
      }
    }
    for (const root of categoryTree.rootCats) walk(root)
    return ids
  }, [categoryTree, expandedCategories])

  const persistTree = useCallback(async (next: Category[], updates: { id: string; parent_category_id: string | null; sort_order: number }[]) => {
    if (updates.length === 0) return
    const prevSnapshot = categories
    setCategories(next) // optimistic
    try {
      const res = await fetch('/api/kb/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) throw new Error('reorder failed')
    } catch {
      setCategories(prevSnapshot) // revert on failure
      try {
        const r = await fetch('/api/kb/categories')
        if (r.ok) { const d = await r.json(); if (Array.isArray(d.categories)) setCategories(d.categories) }
      } catch {}
    }
  }, [categories])

  const handleCatDragEndDnd = useCallback((e: DragEndEvent) => {
    setActiveCatId(null)
    if (!dndEnabled) return
    const { active, over, delta } = e
    if (!over || active.id === over.id) return
    const tree = categories.map(c => ({ id: c.id, parent_category_id: c.parent_category_id ?? null, sort_order: c.sort_order ?? 0 }))
    const flat = flattenTree(tree)
    const moved = moveSubtree(flat, String(active.id), String(over.id), delta.x)
    if (moved === flat) return // invalid (e.g. into own subtree)
    const updates = deriveUpdates(moved)
    const changed = diffUpdates(tree, updates)
    if (changed.length === 0) return
    const byId = new Map(updates.map(u => [u.id, u]))
    const next = categories.map(c => {
      const u = byId.get(c.id)
      return u ? { ...c, parent_category_id: u.parent_category_id, sort_order: u.sort_order } : c
    })
    persistTree(next, changed)
  }, [categories, persistTree])

  const isItemActive = (itemId: string) => pathname === `/kb/item/${itemId}`
  const isCategoryActive = (slug: string) => pathname === `/kb/${slug}`

  // ── Render item row ──────────────────────────────────────────────────────

  const renderItem = (item: SidebarItem, catId: string, childMap: Record<string, SidebarItem[]>, depth: number = 0) => {
    const hasChildren = (childMap[item.id] || []).length > 0
    const isExpanded = expandedItems.has(item.id)
    const isRenaming = renamingItemId === item.id

    return (
      <div key={item.id}>
        <div
          draggable={!selectionMode && !isRenaming}
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOverItem(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnItem(e, item.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setItemContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id, itemTitle: item.title, catId })
          }}
          className={`
            group/item flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all cursor-pointer
            ${depth > 0 ? 'ml-3 pl-3 border-l border-gray-200 dark:border-gray-800' : ''}
            ${dragOverParent === item.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400' : ''}
            ${isItemActive(item.id)
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-medium'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-gray-200'}
          `}
        >
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

          {/* Inline rename input OR link */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renamingItemValue}
              onChange={(e) => setRenamingItemValue(e.target.value)}
              onBlur={() => saveRenameItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRenameItem(item.id)
                if (e.key === 'Escape') { setRenamingItemId(null) }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white dark:bg-gray-800 border border-amber-400 rounded px-1 py-0 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-400/50 min-w-0"
            />
          ) : (
            <Link
              href={`/kb/item/${item.id}`}
              className="truncate flex-1"
              onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                startRenameItem(item.id, item.title, catId)
              }}
              onClick={(e) => { if (selectionMode) { e.preventDefault(); onToggleSelection(item.id) } }}
            >
              {item.title}
            </Link>
          )}

          {/* Favorite + tag count */}
          {!selectionMode && !isRenaming && (
            <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
              {item.tags && item.tags.length > 0 && (
                <span className="text-[9px] text-gray-400 dark:text-gray-600 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {item.tags.length}
                </span>
              )}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.id) }}
                className={`p-0.5 ${favorites.has(item.id) ? 'opacity-100 text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                title={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-3 h-3" fill={favorites.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-1">
            {childMap[item.id].map(child => renderItem(child, catId, childMap, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // ── Render category row ──────────────────────────────────────────────────

  const renderCategory = (cat: Category, depth: number = 0) => {
    const isExpanded = expandedCategories.has(cat.id)
    const isActive = isCategoryActive(cat.slug)
    const isLoading = loadingCategories.has(cat.id)
    const isDropTarget = dragOverCategory === cat.id
    const isRenaming = renamingCatId === cat.id
    const icon = getCatIcon(cat.icon)
    const childCats = categoryTree.childCatMap[cat.id] || []
    const { rootItems, childMap } = getNestedItems(cat.id, sidebarFilter)

    return (
      <SortableCat id={cat.id} key={cat.id}>
        {({ setNodeRef, attributes: gripAttrs, listeners: gripListeners, style: dndStyle, isDragging: dndDragging }) => (
      <div
        ref={setNodeRef}
        style={dndStyle}
        className={`mb-0.5 transition-opacity ${dndDragging ? 'opacity-40' : ''}`}
      >
        {/* Category Row */}
        <div
          onDragOver={(e) => handleDragOverCategory(e, cat.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDropOnCategory(e, cat.id)}
          onContextMenu={(e) => {
            e.preventDefault()
            setContextMenu({ x: e.clientX, y: e.clientY, catId: cat.id, catName: cat.name })
          }}
          className={`
            flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer group transition-all
            ${depth > 0 ? 'ml-3' : ''}
            ${isDropTarget && !draggingCatId ? 'bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-400 ring-inset scale-[1.01]' : ''}
            ${draggingCatId && isDropTarget ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-400 ring-inset' : ''}
            ${isActive && !isRenaming
              ? 'bg-amber-50 dark:bg-amber-900/15 text-amber-800 dark:text-amber-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/60'}
          `}
        >
          {/* Drag handle + expand chevron */}
          <div className="flex-shrink-0 flex items-center gap-0.5">
            {/* Drag handle — dnd-kit grip, visible on hover */}
            <span {...gripAttrs} {...gripListeners} title="Drag to move / nest" className="opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing text-gray-400 select-none text-[10px] leading-none mr-0.5 touch-none">⠿</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id) }}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Category icon */}
          <span className="text-sm flex-shrink-0">{icon}</span>

          {/* Category name — inline rename or link */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renamingCatValue}
              onChange={(e) => setRenamingCatValue(e.target.value)}
              onBlur={() => saveRenameCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRenameCategory(cat.id)
                if (e.key === 'Escape') setRenamingCatId(null)
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white dark:bg-gray-800 border border-amber-400 rounded px-1.5 py-0 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-400/50 min-w-0"
            />
          ) : (
            <Link
              href={`/kb/${cat.slug}`}
              className="flex items-center gap-1 flex-1 min-w-0"
              onDoubleClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                startRenameCategory(cat.id, cat.name)
              }}
              onClick={() => { if (!isExpanded) toggleCategory(cat.id) }}
            >
              <span className="text-xs font-medium truncate">{cat.name}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                {cat.item_count}
              </span>
            </Link>
          )}

          {/* Quick actions — show on hover */}
          {!isRenaming && (
            <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleNewSubCategory(cat.id) }}
                className="p-0.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="New sub-folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); startRenameCategory(cat.id, cat.name) }}
                className="p-0.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                title="Rename"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="ml-5 pl-2.5 border-l border-gray-200 dark:border-gray-800 mt-0.5 mb-1">
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

            {rootItems.map(item => renderItem(item, cat.id, childMap))}
          </div>
        )}
      </div>
        )}
      </SortableCat>
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
            <div
              onDragOver={(e) => {
                if (!draggingCatId) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                setDragOverRoot(true)
              }}
              onDragLeave={() => setDragOverRoot(false)}
              onDrop={handleDropOnRoot}
              className={`flex items-center justify-between px-1 mb-1 rounded transition-colors ${
                dragOverRoot ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-300' : ''
              }`}
              title={draggingCatId ? 'Drop here to move category to root level' : undefined}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                {dragOverRoot ? '↑ Drop to un-nest' : 'Categories'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowEmpty(v => !v)}
                  className="text-[9px] text-gray-400 dark:text-gray-600 hover:text-amber-500 transition-colors"
                  title={showEmpty ? 'Hide empty categories' : 'Show empty categories'}
                >
                  {showEmpty ? 'hide empty' : 'show all'}
                </button>
                <span className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums">
                  {categories.length}
                </span>
              </div>
            </div>

            <DndContext
              sensors={dndSensors}
              collisionDetection={closestCenter}
              onDragStart={(e: DragStartEvent) => setActiveCatId(String(e.active.id))}
              onDragEnd={handleCatDragEndDnd}
              onDragCancel={() => setActiveCatId(null)}
            >
              <SortableContext items={visibleCatIds} strategy={verticalListSortingStrategy}>
                {filteredCategories.map(cat => renderCategory(cat))}
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeCatId ? (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 shadow-lg ring-1 ring-amber-300 dark:ring-amber-700 text-xs font-medium text-gray-800 dark:text-gray-200">
                    <span className="text-sm">{getCatIcon(categories.find(c => c.id === activeCatId)?.icon || '')}</span>
                    <span className="truncate max-w-[140px]">{categories.find(c => c.id === activeCatId)?.name}</span>
                    {(() => {
                      const kids = categories.filter(c => c.parent_category_id === activeCatId).length
                      return kids > 0 ? <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">+{kids}</span> : null
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
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
          <p className="mt-1.5 text-[9px] text-gray-300 dark:text-gray-700 leading-snug">
            Double-click = rename · Drag = move/nest · Right-click = menu · Drop category on header = un-nest
          </p>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[200] py-1 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-xs"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate border-b border-gray-100 dark:border-gray-800 mb-1">
            {contextMenu.catName}
          </div>
          <button
            onClick={() => startRenameCategory(contextMenu.catId, contextMenu.catName)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Rename
          </button>
          <button
            onClick={() => handleNewSubCategory(contextMenu.catId)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
            New sub-folder
          </button>
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button
            onClick={() => handleDeleteCategory(contextMenu.catId)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete category
          </button>
        </div>
      )}

      {/* Item Context Menu */}
      {itemContextMenu && (
        <div
          ref={itemContextMenuRef}
          style={{ top: itemContextMenu.y, left: itemContextMenu.x }}
          className="fixed z-[200] py-1 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-xs"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate border-b border-gray-100 dark:border-gray-800 mb-1">
            {itemContextMenu.itemTitle}
          </div>

          <button
            onClick={() => {
              startRenameItem(itemContextMenu.itemId, itemContextMenu.itemTitle, itemContextMenu.catId)
              setItemContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Rename
          </button>

          {/* Move to → submenu */}
          <button
            onMouseEnter={() => setMoveMenuOpen(true)}
            onClick={() => setMoveMenuOpen(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Move to…
            </span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {moveMenuOpen && (
            <div className="max-h-60 overflow-y-auto border-y border-gray-100 dark:border-gray-800 my-1 bg-gray-50/50 dark:bg-gray-950/50">
              {allCategoriesFlat.map(c => (
                <button
                  key={c.id}
                  disabled={c.id === itemContextMenu.catId}
                  onClick={() => handleMoveItemToCategory(itemContextMenu.itemId, itemContextMenu.catId, c.id)}
                  className={`w-full flex items-center gap-2 px-4 py-1 text-[11px] transition-colors ${
                    c.id === itemContextMenu.catId
                      ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300'
                  }`}
                >
                  <span className="text-xs">{getCatIcon(c.icon)}</span>
                  <span className="truncate">{c.name}</span>
                  {c.id === itemContextMenu.catId && <span className="ml-auto text-[9px] italic">current</span>}
                </button>
              ))}
            </div>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button
            onClick={() => handleDeleteItem(itemContextMenu.itemId, itemContextMenu.catId)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete page
          </button>
        </div>
      )}
    </>
  )
}
