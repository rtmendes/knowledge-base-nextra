// SortableTree engine for the KB category sidebar (Notion-style, dnd-kit flat-tree
// pattern). A dragged category carries its ENTIRE subtree; depth is projected from
// the horizontal pointer offset and clamped to a valid range; the result is mapped
// back to { parent_category_id, sort_order } for every category so the database is
// the single source of truth for where everything lives.
// Engine ported from the command-v2 sidebar-tree (8/8 unit-tested) and adapted to
// the kb_categories parent_category_id + sort_order model.

export interface TreeCategory {
  id: string
  parent_category_id?: string | null
  sort_order: number
}

export interface FlatNode {
  id: string
  depth: number
}

export interface CategoryUpdate {
  id: string
  parent_category_id: string | null
  sort_order: number
}

export const INDENT_PX = 16 // horizontal px per nesting level

/** DFS-ordered flat list of ALL categories, depth derived from the parent chain. */
export function flattenTree(categories: TreeCategory[]): FlatNode[] {
  const childrenOf = new Map<string | null, TreeCategory[]>()
  for (const c of categories) {
    const key = c.parent_category_id ?? null
    if (!childrenOf.has(key)) childrenOf.set(key, [])
    childrenOf.get(key)!.push(c)
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }
  const out: FlatNode[] = []
  const walk = (parent: string | null, depth: number) => {
    for (const c of childrenOf.get(parent) ?? []) {
      out.push({ id: c.id, depth })
      walk(c.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

/** Indices of every descendant of the node at index `i` (contiguous in a DFS flat list). */
export function getDescendantIndices(flat: FlatNode[], i: number): number[] {
  const out: number[] = []
  const rootDepth = flat[i].depth
  for (let j = i + 1; j < flat.length; j++) {
    if (flat[j].depth <= rootDepth) break
    out.push(j)
  }
  return out
}

/** True if `targetId` is the root or any descendant of the subtree rooted at `activeId`. */
export function isInSubtree(flat: FlatNode[], activeId: string, targetId: string): boolean {
  if (activeId === targetId) return true
  const i = flat.findIndex(n => n.id === activeId)
  if (i < 0) return false
  return getDescendantIndices(flat, i).some(d => flat[d].id === targetId)
}

/**
 * Move the subtree rooted at `activeId` so it lands relative to `overId`, at a depth
 * projected from the horizontal drag offset. Children travel with the root. Returns a
 * new flat list (ids + depths); never mutates the input.
 */
export function moveSubtree(
  flat: FlatNode[],
  activeId: string,
  overId: string,
  offsetX: number,
): FlatNode[] {
  const from = flat.findIndex(n => n.id === activeId)
  const overIdx = flat.findIndex(n => n.id === overId)
  if (from < 0 || overIdx < 0 || isInSubtree(flat, activeId, overId)) return flat

  const descendants = getDescendantIndices(flat, from)
  const subtree = [flat[from], ...descendants.map(d => flat[d])]
  const subtreeIds = new Set(subtree.map(n => n.id))
  const rest = flat.filter(n => !subtreeIds.has(n.id))

  // Insertion point in `rest`: after the over node's own subtree when dragging down,
  // before it when dragging up — keeps sibling subtrees contiguous.
  const overInRest = rest.findIndex(n => n.id === overId)
  let insertIdx: number
  if (overInRest < 0) {
    insertIdx = rest.length
  } else if (from < overIdx) {
    insertIdx = overInRest + 1 + getDescendantIndices(rest, overInRest).length
  } else {
    insertIdx = overInRest
  }

  // Projected depth: clamp between the next node's depth and prev node's depth + 1.
  const prev = insertIdx > 0 ? rest[insertIdx - 1] : undefined
  const next = insertIdx < rest.length ? rest[insertIdx] : undefined
  const maxDepth = prev ? prev.depth + 1 : 0
  const minDepth = next ? next.depth : 0
  const wanted = Math.round(offsetX / INDENT_PX) + flat[from].depth
  const newRootDepth = Math.max(minDepth, Math.min(wanted, maxDepth))

  const delta = newRootDepth - subtree[0].depth
  const moved = subtree.map(n => ({ id: n.id, depth: Math.max(0, n.depth + delta) }))

  const out = [...rest]
  out.splice(insertIdx, 0, ...moved)
  return out
}

/**
 * Derive the DB updates ({ parent_category_id, sort_order }) from an ordered flat
 * list with depths. parent = nearest preceding node one level shallower; sort_order =
 * running index among siblings of the same parent.
 */
export function deriveUpdates(flat: FlatNode[]): CategoryUpdate[] {
  const parentAtDepth = new Map<number, string>()
  const orderByParent = new Map<string | null, number>()
  const updates: CategoryUpdate[] = []
  for (const node of flat) {
    const parent = node.depth === 0 ? null : parentAtDepth.get(node.depth - 1) ?? null
    const order = orderByParent.get(parent) ?? 0
    orderByParent.set(parent, order + 1)
    parentAtDepth.set(node.depth, node.id)
    // a node can't be its own ancestor's parent slot — clear deeper cache
    for (const d of [...parentAtDepth.keys()]) if (d > node.depth) parentAtDepth.delete(d)
    parentAtDepth.set(node.depth, node.id)
    updates.push({ id: node.id, parent_category_id: parent, sort_order: order })
  }
  return updates
}

/** Only the rows whose parent or order actually changed — minimal write set. */
export function diffUpdates(
  before: TreeCategory[],
  updates: CategoryUpdate[],
): CategoryUpdate[] {
  const prev = new Map(before.map(c => [c.id, c]))
  return updates.filter(u => {
    const p = prev.get(u.id)
    if (!p) return true
    return (p.parent_category_id ?? null) !== u.parent_category_id || (p.sort_order ?? 0) !== u.sort_order
  })
}
