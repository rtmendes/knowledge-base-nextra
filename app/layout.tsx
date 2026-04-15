import { Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'
import { getNavTree, navTreeToPageMap } from '../lib/page-map'
import { ChatWidget } from '../components/ChatWidget'

export const metadata = {
  title: 'InsightProfit Knowledge Base',
  description: 'Complete knowledge base for Insight Profit products and workflows',
}

// ── Static pages that always appear in the sidebar ──────────────────────────
// These are App Router MDX pages NOT managed by Keystatic, so we hardcode them.
const STATIC_PAGE_MAP: any[] = [
  {
    kind: 'MdxPage',
    name: 'index',
    route: '/',
    frontMatter: { title: 'Home' },
  },
  {
    kind: 'MdxPage',
    name: 'genspark',
    route: '/genspark',
    frontMatter: { title: '⚡ Genspark Projects' },
  },
  {
    kind: 'Folder',
    name: 'ai-research',
    route: '/ai-research',
    children: [
      {
        kind: 'MdxPage',
        name: 'manus',
        route: '/ai-research/manus',
        frontMatter: { title: '🤖 Manus AI Research' },
      },
    ],
  },
]

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Try to load additional Keystatic docs and merge them into the sidebar.
  // If Keystatic reader fails (no content yet, or GitHub storage issues in prod),
  // we still show the hardcoded pages above.
  let pageMap: any[] = STATIC_PAGE_MAP

  try {
    const tree = await getNavTree()
    const dynamic = navTreeToPageMap(tree).filter(
      // Remove any Keystatic entries that duplicate our static pages
      (item: any) =>
        item.name !== 'index' &&
        item.name !== 'genspark' &&
        item.name !== 'ai-research'
    )
    if (dynamic.length > 0) {
      pageMap = [...STATIC_PAGE_MAP, ...dynamic]
    }
  } catch {
    // Content directory not yet populated — static pages are enough
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  InsightProfit KB
                </span>
              }
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/rtmendes/knowledge-base-nextra"
          editLink={null}
          footer={
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                fontSize: '0.875rem',
                color: '#6b7280',
              }}
            >
              <span>© 2026 Insight Profit. All rights reserved.</span>
              <a
                href="/keystatic"
                style={{ color: '#6b7280', textDecoration: 'none' }}
              >
                ✏️ Admin Editor
              </a>
            </div>
          }
        >
          {children}
        </Layout>
        <ChatWidget />
      </body>
    </html>
  )
}
