'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

interface ResizeHandleProps {
  onResize: (delta: number) => void
  direction?: 'left' | 'right'
  className?: string
}

/**
 * Draggable resize handle between panels.
 * `direction` indicates which side the adjacent panel is on:
 *   - 'left'  → dragging right grows the left panel
 *   - 'right' → dragging left grows the right panel
 */
export function ResizeHandle({ onResize, direction = 'left', className = '' }: ResizeHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    lastX.current = e.clientX
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return
    const delta = e.clientX - lastX.current
    lastX.current = e.clientX
    onResize(direction === 'left' ? delta : -delta)
  }, [onResize, direction])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

  return (
    <div
      ref={handleRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`
        group relative flex-shrink-0 w-[5px] cursor-col-resize
        flex items-center justify-center
        hover:bg-amber-400/20 active:bg-amber-400/30
        transition-colors duration-150
        ${className}
      `}
      title="Drag to resize"
    >
      {/* Visible grip line */}
      <div className="absolute inset-y-0 w-[1px] bg-gray-200 dark:bg-gray-800 group-hover:bg-amber-400 group-active:bg-amber-500 transition-colors" />
      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  )
}

interface PanelSizes {
  sidebar: number
  rightPanel: number
}

const STORAGE_KEY = 'kb-panel-sizes'
const DEFAULT_SIDEBAR = 288     // w-72
const DEFAULT_RIGHT = 360       // wider than the old w-56 (224px)
const MIN_SIDEBAR = 200
const MAX_SIDEBAR = 420
const MIN_RIGHT = 200
const MAX_RIGHT = 600
const MIN_CENTER = 400

function loadSizes(): PanelSizes {
  if (typeof window === 'undefined') return { sidebar: DEFAULT_SIDEBAR, rightPanel: DEFAULT_RIGHT }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        sidebar: Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, parsed.sidebar || DEFAULT_SIDEBAR)),
        rightPanel: Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, parsed.rightPanel || DEFAULT_RIGHT)),
      }
    }
  } catch {}
  return { sidebar: DEFAULT_SIDEBAR, rightPanel: DEFAULT_RIGHT }
}

function saveSizes(sizes: PanelSizes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes))
  } catch {}
}

interface ResizablePanelGroupProps {
  sidebar: React.ReactNode
  sidebarVisible: boolean
  children: React.ReactNode       // center content
  rightPanel?: React.ReactNode
  rightPanelVisible: boolean
}

export function ResizablePanelGroup({
  sidebar,
  sidebarVisible,
  children,
  rightPanel,
  rightPanelVisible,
}: ResizablePanelGroupProps) {
  const [sizes, setSizes] = useState<PanelSizes>({ sidebar: DEFAULT_SIDEBAR, rightPanel: DEFAULT_RIGHT })
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved sizes on mount
  useEffect(() => {
    setSizes(loadSizes())
  }, [])

  const handleSidebarResize = useCallback((delta: number) => {
    setSizes(prev => {
      const next = { ...prev, sidebar: Math.max(MIN_SIDEBAR, Math.min(MAX_SIDEBAR, prev.sidebar + delta)) }
      saveSizes(next)
      return next
    })
  }, [])

  const handleRightResize = useCallback((delta: number) => {
    setSizes(prev => {
      const next = { ...prev, rightPanel: Math.max(MIN_RIGHT, Math.min(MAX_RIGHT, prev.rightPanel + delta)) }
      saveSizes(next)
      return next
    })
  }, [])

  // Double-click to reset
  const handleResetSidebar = useCallback(() => {
    setSizes(prev => {
      const next = { ...prev, sidebar: DEFAULT_SIDEBAR }
      saveSizes(next)
      return next
    })
  }, [])

  const handleResetRight = useCallback(() => {
    setSizes(prev => {
      const next = { ...prev, rightPanel: DEFAULT_RIGHT }
      saveSizes(next)
      return next
    })
  }, [])

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Left Sidebar */}
      {sidebarVisible && (
        <>
          <div
            className="flex-shrink-0 overflow-hidden hidden lg:block"
            style={{ width: sizes.sidebar }}
          >
            {sidebar}
          </div>
          <div onDoubleClick={handleResetSidebar} className="hidden lg:block">
            <ResizeHandle onResize={handleSidebarResize} direction="left" />
          </div>
        </>
      )}

      {/* Center Content — fills remaining space */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {children}
      </div>

      {/* Right Panel */}
      {rightPanelVisible && rightPanel && (
        <>
          <div onDoubleClick={handleResetRight} className="hidden xl:block">
            <ResizeHandle onResize={handleRightResize} direction="right" />
          </div>
          <div
            className="flex-shrink-0 overflow-y-auto hidden xl:block border-l border-gray-100 dark:border-gray-800 py-6 px-4"
            style={{ width: sizes.rightPanel }}
          >
            {rightPanel}
          </div>
        </>
      )}
    </div>
  )
}
