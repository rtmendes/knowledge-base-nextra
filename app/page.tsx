import Link from 'next/link'
import { getNavTree, type NavItem } from '../lib/page-map'

// Icon map for known doc sections
const SECTION_ICONS: Record<string, string> = {
  'insightprofit-popebot': '🤖',
  'business-sops':         '📋',
  'elite-writer':          '✍️',
  'interactive-apps':      '⚡',
  'projects-roadmaps':     '🗺️',
  'family-gift-studio':    '🎁',
}

function DocCard({ item }: { item: NavItem }) {
  const icon = SECTION_ICONS[item.name] || '📄'
  const childCount = item.children?.length ?? 0

  return (
    <Link
      href={item.route}
      className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {childCount > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {childCount} page{childCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {item.title}
      </h3>
      {item.children && item.children.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {item.children.map((c) => c.title).join(' · ')}
        </p>
      )}
      <span className="mt-auto text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
        View docs →
      </span>
    </Link>
  )
}

export default async function HomePage() {
  let navItems: NavItem[] = []
  try {
    navItems = await getNavTree()
  } catch {
    // content not yet populated
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-3">
          InsightProfit Knowledge Base
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
          Documentation, guides, SOPs, and product notes for the InsightProfit ecosystem.
          Browse a section below or open the editor to create new pages.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/keystatic"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          ✏️ Open Editor
        </Link>
        <Link
          href="/import"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          📥 Import Markdown
        </Link>
      </div>

      {/* Card grid — auto-populated from Keystatic collection */}
      {navItems.length > 0 ? (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Documentation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {navItems.map((item) => (
              <DocCard key={item.route} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">No documentation pages yet.</p>
          <Link
            href="/keystatic"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            ✏️ Create your first page
          </Link>
        </div>
      )}

      {/* Capabilities grid */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">What this KB supports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          {[
            ['📝', 'Write & edit docs in the visual Keystatic editor'],
            ['📥', 'Import existing .md files — auto-converted to docs'],
            ['🌐', 'Embed live HTML pages, iframes, and interactive apps'],
            ['🎥', 'Embed YouTube / Loom videos inline'],
            ['📎', 'Attach files (PDFs, ZIPs, images) to any doc'],
            ['🔔', 'Rich callout blocks: Note, Warning, Tip, Error'],
            ['🪜', 'Step-by-step guides with numbered steps'],
            ['🃏', 'Card grids for visual navigation'],
          ].map(([icon, text]) => (
            <div key={text as string} className="flex items-start gap-2">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
