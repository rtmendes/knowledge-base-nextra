import Link from 'next/link'
import { supabaseAdmin } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Enterprise Departments — Knowledge Base — InsightProfit',
  description: 'All 10 enterprise department SOPs, PRDs, tech stacks, goals, and team responsibilities.',
}

// Department display config
const DEPT_CONFIG: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  'chief of staff':        { icon: '👑', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/20', borderColor: 'border-purple-200 dark:border-purple-800' },
  'product engineering':   { icon: '⚙️', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' },
  'marketing content':     { icon: '📣', color: 'text-pink-700 dark:text-pink-300', bgColor: 'bg-pink-50 dark:bg-pink-900/20', borderColor: 'border-pink-200 dark:border-pink-800' },
  'revenue sales':         { icon: '💰', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-200 dark:border-emerald-800' },
  'brand creative':        { icon: '🎨', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-50 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-800' },
  'operations fulfillment':{ icon: '📦', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-800' },
  'finance analytics':     { icon: '📊', color: 'text-teal-700 dark:text-teal-300', bgColor: 'bg-teal-50 dark:bg-teal-900/20', borderColor: 'border-teal-200 dark:border-teal-800' },
  'hr talent':             { icon: '👥', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  'legal compliance':      { icon: '⚖️', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
  'customer success':      { icon: '🤝', color: 'text-cyan-700 dark:text-cyan-300', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20', borderColor: 'border-cyan-200 dark:border-cyan-800' },
}

// Desired display order
const DEPT_ORDER = [
  'chief of staff', 'product engineering', 'marketing content', 'revenue sales',
  'brand creative', 'operations fulfillment', 'finance analytics', 'hr talent',
  'legal compliance', 'customer success',
]

interface DeptData {
  key: string
  sop: { id: string; title: string; word_count: number; updated_at: string } | null
  prd: { id: string; title: string; word_count: number; updated_at: string } | null
  config: { icon: string; color: string; bgColor: string; borderColor: string }
}

async function getDepartmentDocs(): Promise<DeptData[]> {
  if (!supabaseAdmin) return []

  // Fetch all department SOPs
  const { data: sops } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, slug, word_count, updated_at, tags')
    .eq('item_type', 'department_sop')
    .eq('status', 'active')
    .order('title')

  // Fetch all department PRDs
  const { data: prds } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, slug, word_count, updated_at, tags')
    .eq('item_type', 'prd')
    .ilike('title', '%Department%PRD%')
    .eq('status', 'active')
    .order('title')

  // Match SOPs and PRDs to departments
  const departments: DeptData[] = []

  for (const deptKey of DEPT_ORDER) {
    const config = DEPT_CONFIG[deptKey] || { icon: '📋', color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }

    // Find matching SOP
    const sop = (sops || []).find(s => {
      const titleLower = s.title.toLowerCase()
      const deptWords = deptKey.split(' ')
      return deptWords.every(w => titleLower.includes(w))
    })

    // Find matching PRD
    const prd = (prds || []).find(p => {
      const titleLower = p.title.toLowerCase()
      const deptWords = deptKey.split(' ')
      return deptWords.every(w => titleLower.includes(w))
    })

    departments.push({
      key: deptKey,
      sop: sop ? { id: sop.id, title: sop.title, word_count: sop.word_count, updated_at: sop.updated_at } : null,
      prd: prd ? { id: prd.id, title: prd.title, word_count: prd.word_count, updated_at: prd.updated_at } : null,
      config,
    })
  }

  return departments
}

// Also fetch all other (non-department) SOPs and PRDs
async function getOtherDocs() {
  if (!supabaseAdmin) return { sops: [], prds: [] }

  const { data: sops } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, word_count, updated_at, item_type')
    .eq('item_type', 'sop')
    .eq('status', 'active')
    .order('title')

  const { data: prds } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, word_count, updated_at, item_type')
    .eq('item_type', 'prd')
    .not('title', 'ilike', '%Department%PRD%')
    .eq('status', 'active')
    .order('title')

  return { sops: sops || [], prds: prds || [] }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function DepartmentsPage() {
  const [departments, { sops: otherSops, prds: otherPrds }] = await Promise.all([
    getDepartmentDocs(),
    getOtherDocs(),
  ])

  const totalSopWords = departments.reduce((s, d) => s + (d.sop?.word_count || 0), 0)
  const totalPrdWords = departments.reduce((s, d) => s + (d.prd?.word_count || 0), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 pt-8 mb-8 text-xs text-gray-400 dark:text-gray-500">
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href="/kb" className="hover:text-amber-500 transition-colors">Knowledge Base</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-600 dark:text-gray-300 font-medium">Departments</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-purple-600 via-blue-600 to-amber-500 bg-clip-text text-transparent">
          Enterprise Departments
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mb-6">
          Complete SOPs, PRDs, tech stacks, goals, and team responsibilities for all 10 InsightProfit departments.
          Every document is searchable, editable, and shareable.
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">{departments.filter(d => d.sop).length}</span>
            <span className="text-xs text-amber-700 dark:text-amber-300">Department SOPs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{departments.filter(d => d.prd).length}</span>
            <span className="text-xs text-blue-700 dark:text-blue-300">Department PRDs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{(totalSopWords + totalPrdWords).toLocaleString()}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Words</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{otherSops.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Other SOPs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{otherPrds.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Other PRDs</span>
          </div>
        </div>
      </div>

      {/* ── Department Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {departments.map((dept) => {
          const displayName = dept.key.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

          return (
            <div
              key={dept.key}
              className={`rounded-xl border ${dept.config.borderColor} ${dept.config.bgColor} p-5 hover:shadow-md transition-shadow`}
            >
              {/* Dept header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{dept.config.icon}</span>
                <h2 className={`text-lg font-bold ${dept.config.color}`}>{displayName}</h2>
              </div>

              {/* Document links */}
              <div className="space-y-2">
                {dept.sop && (
                  <Link
                    href={`/kb/item/${dept.sop.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/40 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-amber-500 text-sm flex-shrink-0">📋</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                          Department SOP
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {dept.sop.word_count.toLocaleString()} words · Updated {formatDate(dept.sop.updated_at)}
                        </div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {dept.prd && (
                  <Link
                    href={`/kb/item/${dept.prd.id}`}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/40 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-blue-500 text-sm flex-shrink-0">📐</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          Department PRD
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {dept.prd.word_count.toLocaleString()} words · Updated {formatDate(dept.prd.updated_at)}
                        </div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
                {!dept.sop && !dept.prd && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 italic px-3 py-2">
                    No documents yet
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Other SOPs Section ──────────────────────────────────── */}
      {otherSops.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>📋</span> All SOPs <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({otherSops.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {otherSops.map((sop: any) => (
              <Link
                key={sop.id}
                href={`/kb/item/${sop.id}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-all group"
              >
                <span className="text-amber-500 text-xs flex-shrink-0">📋</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                  {sop.title}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {sop.word_count > 0 ? `${sop.word_count.toLocaleString()}w` : '—'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Other PRDs Section ──────────────────────────────────── */}
      {otherPrds.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <span>📐</span> All PRDs <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({otherPrds.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {otherPrds.map((prd: any) => (
              <Link
                key={prd.id}
                href={`/kb/item/${prd.id}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
              >
                <span className="text-blue-500 text-xs flex-shrink-0">📐</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {prd.title}
                </span>
                <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {prd.word_count > 0 ? `${prd.word_count.toLocaleString()}w` : '—'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
