import Link from 'next/link'
import { getNavTree, type NavItem } from '../lib/page-map'

const MAIN_SECTIONS = [
  {
    route: '/genspark',
    title: 'Genspark Projects',
    emoji: '⚡',
    description:
      'All 100 Genspark workspace projects — extracted, categorized, and linked for quick access.',
    stats: [
      { label: 'Projects', value: '100' },
      { label: 'Categories', value: '7' },
    ],
    tags: ['Tech · Builds', 'Marketing', 'Personal', 'Consulting'],
  },
  {
    route: '/ai-research/manus',
    title: 'Manus AI Research',
    emoji: '🤖',
    description:
      '81 Manus.im research builds — tech, business, marketing, content, and more. 624K credits used.',
    stats: [
      { label: 'Projects', value: '81' },
      { label: 'Credits Used', value: '624K' },
    ],
    tags: ['Tech · Builds', 'Business', 'Marketing', 'Content'],
  },
]

// Section icon map for dynamic Keystatic cards
const SECTION_ICONS: Record<string, string> = {
  'insightprofit-popebot': '🤖',
  'business-sops': '📋',
  'elite-writer': '✍️',
  'interactive-apps': '⚡',
  'projects-roadmaps': '🗺️',
  'family-gift-studio': '🎁',
  genspark: '⚡',
  'ai-research': '🔬',
}

function DocCard({ item }: { item: NavItem }) {
  const icon = SECTION_ICONS[item.name] || '📄'
  const childCount = item.children?.length ?? 0
  return (
    <Link
      href={item.route}
      className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {childCount > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {childCount} page{childCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
        {item.title}
      </h3>
      {item.children && item.children.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {item.children.map((c) => c.title).join(' · ')}
        </p>
      )}
      <span className="mt-auto text-xs font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
        View docs →
      </span>
    </Link>
  )
}

export default async function HomePage() {
  // Load any additional Keystatic docs (graceful fallback to empty)
  let extraNavItems: NavItem[] = []
  try {
    const all = await getNavTree()
    // Exclude the two main sections already shown above
    extraNavItems = all.filter(
      (item) => item.name !== 'genspark' && item.name !== 'ai-research'
    )
  } catch {
    /* content not yet populated or reader error */
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 mb-4">
          📚 InsightProfit Knowledge Base
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-3">
          Everything, Organized
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          AI research, project archives, SOPs, and documentation for the InsightProfit ecosystem.
        </p>
      </div>

      {/* ── Main section cards (always visible) ─────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 mb-10">
        {MAIN_SECTIONS.map((section) => (
          <Link
            key={section.route}
            href={section.route}
            className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-6 shadow-sm hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-500/50 transition-all duration-200 overflow-hidden"
          >
            {/* subtle gold shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative">
              <span className="text-4xl mb-4 block">{section.emoji}</span>

              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {section.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                {section.description}
              </p>

              {/* Tags row */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {section.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats + CTA */}
              <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-700/60">
                <div className="flex gap-5">
                  {section.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Additional Keystatic docs (if any) ─────────────────────── */}
      {extraNavItems.length > 0 && (
        <>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            More Documentation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {extraNavItems.map((item) => (
              <DocCard key={item.route} item={item} />
            ))}
          </div>
        </>
      )}

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Link
          href="/keystatic"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500/60 transition-colors"
        >
          ✏️ Open Editor
        </Link>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500/60 transition-colors"
        >
          📥 Import Markdown
        </Link>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200/50 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-5">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
          {[
            { value: '100', label: 'Genspark projects' },
            { value: '81', label: 'Manus projects' },
            { value: '624K', label: 'AI credits used' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              {i > 0 && (
                <span className="hidden sm:block w-px h-7 bg-amber-200 dark:bg-amber-700/40" />
              )}
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </span>
                <span className="ml-1.5 text-gray-500 dark:text-gray-400">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
