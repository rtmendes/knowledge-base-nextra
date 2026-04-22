import { supabaseAdmin } from './supabase'

// ── Types ─────────────────────────────────────────────────────────────────

export interface KBCategory {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  description: string
  item_count: number
  sort_order: number
  is_system: boolean
}

export interface KBItem {
  id: string
  title: string
  slug: string
  item_type: string
  category_id: string
  content?: string
  content_plain?: string
  word_count: number
  tags: string[]
  status: string
  metadata: any
  summary?: string
  use_cases?: string[]
  bound_brands: string[]
  bound_features: string[]
  bound_publications: string[]
  created_at?: string
  updated_at?: string
  source_url?: string
  category?: KBCategory
}

// ── Item Type Config ──────────────────────────────────────────────────────

export const ITEM_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bgColor: string; dotColor: string }> = {
  genspark_chat:    { label: 'Genspark',        emoji: '⚡', color: 'text-violet-700 dark:text-violet-300',  bgColor: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',  dotColor: 'bg-violet-500' },
  manus_session:    { label: 'Manus',           emoji: '🤖', color: 'text-blue-700 dark:text-blue-300',     bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         dotColor: 'bg-blue-500' },
  manus_doc:        { label: 'Manus Doc',       emoji: '📄', color: 'text-blue-700 dark:text-blue-300',     bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         dotColor: 'bg-blue-500' },
  manus_output:     { label: 'Manus Output',    emoji: '📋', color: 'text-blue-700 dark:text-blue-300',     bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         dotColor: 'bg-blue-500' },
  manus_file:       { label: 'Manus File',      emoji: '📂', color: 'text-blue-700 dark:text-blue-300',     bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         dotColor: 'bg-blue-500' },
  manus_task:       { label: 'Manus Task',      emoji: '✅', color: 'text-blue-700 dark:text-blue-300',     bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',         dotColor: 'bg-blue-500' },
  chatgpt_chat:     { label: 'ChatGPT',         emoji: '💬', color: 'text-green-700 dark:text-green-300',   bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',     dotColor: 'bg-green-500' },
  sop:              { label: 'SOP',             emoji: '📋', color: 'text-amber-700 dark:text-amber-300',   bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',     dotColor: 'bg-amber-500' },
  department_sop:   { label: 'Dept SOP',        emoji: '🏢', color: 'text-amber-700 dark:text-amber-300',   bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',     dotColor: 'bg-amber-500' },
  prd:              { label: 'PRD',             emoji: '📐', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', dotColor: 'bg-indigo-500' },
  inspiration:      { label: 'Inspiration',     emoji: '💡', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', dotColor: 'bg-yellow-500' },
  agent:            { label: 'Agent',           emoji: '🤖', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', dotColor: 'bg-purple-500' },
  agent_workflow:   { label: 'Workflow',         emoji: '⚙️', color: 'text-slate-700 dark:text-slate-300',   bgColor: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800',     dotColor: 'bg-slate-500' },
  autopilotagent:   { label: 'AutoPilot',       emoji: '🚀', color: 'text-cyan-700 dark:text-cyan-300',     bgColor: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',         dotColor: 'bg-cyan-500' },
  interactive:      { label: 'Interactive',     emoji: '🌐', color: 'text-teal-700 dark:text-teal-300',     bgColor: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800',         dotColor: 'bg-teal-500' },
  'product-catalog':{ label: 'Product',         emoji: '🏷️', color: 'text-rose-700 dark:text-rose-300',     bgColor: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',         dotColor: 'bg-rose-500' },
  'brand-guide':    { label: 'Brand Guide',     emoji: '🎨', color: 'text-pink-700 dark:text-pink-300',     bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',         dotColor: 'bg-pink-500' },
  spark:            { label: 'Spark',           emoji: '✨', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', dotColor: 'bg-orange-500' },
  imported:         { label: 'Imported',         emoji: '📥', color: 'text-gray-700 dark:text-gray-300',     bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',         dotColor: 'bg-gray-500' },
  launch_plan:      { label: 'Launch Plan',     emoji: '🚀', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
  spreadsheet:      { label: 'Spreadsheet',     emoji: '📊', color: 'text-green-700 dark:text-green-300',   bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',     dotColor: 'bg-green-500' },
}

export function getItemTypeConfig(type: string) {
  return ITEM_TYPE_CONFIG[type] || {
    label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    emoji: '📄',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    dotColor: 'bg-gray-500',
  }
}

// ── Category Icon Mapping ─────────────────────────────────────────────────

export const CATEGORY_ICON_MAP: Record<string, string> = {
  'fas fa-robot': '🤖', 'fas fa-cogs': '⚙️', 'fas fa-plane': '✈️',
  'fas fa-gem': '💎', 'fas fa-chart-line': '📈', 'fas fa-bullhorn': '📢',
  'fas fa-graduation-cap': '🎓', 'fas fa-pray': '🙏', 'fas fa-heartbeat': '💪',
  'fas fa-utensils': '🍽️', 'fas fa-folder': '📁', 'fas fa-book': '📚',
  'fas fa-star': '⭐', 'fas fa-music': '🎵', 'fas fa-newspaper': '📰',
  'fas fa-users': '👨‍👩‍👧‍👦', 'fas fa-dollar-sign': '💰', 'fas fa-store': '🏪',
  'fas fa-home': '🏠', 'fas fa-flask': '🔬', 'fas fa-search': '🔍',
  'fas fa-code': '💻', 'fas fa-server': '🖥️', 'fas fa-video': '🎬',
  'fas fa-heart': '❤️', 'fas fa-play-circle': '▶️',
}

export function getCategoryIcon(iconClass: string): string {
  return CATEGORY_ICON_MAP[iconClass] || '📁'
}

// ── Data Fetching ─────────────────────────────────────────────────────────

export async function getCategories(): Promise<KBCategory[]> {
  if (!supabaseAdmin) return []
  const { data, error } = await supabaseAdmin
    .from('kb_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[kb] getCategories error:', error); return [] }
  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<KBCategory | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('kb_categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error('[kb] getCategoryBySlug error:', error); return null }
  return data
}

export async function getItems(opts: {
  categoryId?: string
  itemType?: string
  search?: string
  status?: string
  page?: number
  limit?: number
  hasContent?: boolean
}): Promise<{ items: KBItem[]; total: number }> {
  if (!supabaseAdmin) return { items: [], total: 0 }

  const page = opts.page || 1
  const limit = Math.min(opts.limit || 50, 100)
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('knowledge_items')
    .select('id, title, slug, item_type, category_id, word_count, tags, status, summary, use_cases, bound_brands, bound_features, bound_publications, created_at, updated_at, metadata', { count: 'exact' })

  if (opts.categoryId) query = query.eq('category_id', opts.categoryId)
  if (opts.itemType) query = query.eq('item_type', opts.itemType)
  if (opts.status) query = query.eq('status', opts.status)
  if (opts.hasContent) query = query.gt('word_count', 0)

  if (opts.search) {
    query = query.or(`title.ilike.%${opts.search}%,content_plain.ilike.%${opts.search}%`)
  }

  query = query
    .order('word_count', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) { console.error('[kb] getItems error:', error); return { items: [], total: 0 } }
  return { items: data || [], total: count || 0 }
}

export async function getItemById(id: string): Promise<KBItem | null> {
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('knowledge_items')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { console.error('[kb] getItemById error:', error); return null }
  return data
}

export async function getItemsByCategory(categorySlug: string, opts?: {
  page?: number
  limit?: number
  search?: string
  itemType?: string
}): Promise<{ items: KBItem[]; total: number; category: KBCategory | null }> {
  const category = await getCategoryBySlug(categorySlug)
  if (!category) return { items: [], total: 0, category: null }

  const result = await getItems({
    categoryId: category.id,
    page: opts?.page,
    limit: opts?.limit,
    search: opts?.search,
    itemType: opts?.itemType,
  })

  return { ...result, category }
}

export async function getItemTypeCounts(categoryId?: string): Promise<Record<string, number>> {
  if (!supabaseAdmin) return {}

  let query = supabaseAdmin
    .from('knowledge_items')
    .select('item_type')

  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) { console.error('[kb] getItemTypeCounts error:', error); return {} }

  const counts: Record<string, number> = {}
  for (const item of data || []) {
    const t = item.item_type || 'unknown'
    counts[t] = (counts[t] || 0) + 1
  }
  return counts
}

export async function getTotalStats(): Promise<{ totalItems: number; totalCategories: number; totalWithContent: number }> {
  if (!supabaseAdmin) return { totalItems: 0, totalCategories: 0, totalWithContent: 0 }

  const [itemsRes, catsRes, contentRes] = await Promise.all([
    supabaseAdmin.from('knowledge_items').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('kb_categories').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('knowledge_items').select('id', { count: 'exact', head: true }).gt('word_count', 0),
  ])

  return {
    totalItems: itemsRes.count || 0,
    totalCategories: catsRes.count || 0,
    totalWithContent: contentRes.count || 0,
  }
}
