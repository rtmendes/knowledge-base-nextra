import { Layout, Navbar } from 'nextra-theme-docs'
import type { ReactNode } from 'react'
import { getNavTree, navTreeToPageMap } from '../../lib/page-map'

export const dynamic = 'force-dynamic'

const STATIC_PAGE_MAP: any[] = [
  {
    kind: 'MdxPage',
    name: 'index',
    route: '/',
    frontMatter: { title: 'Home' },
  },
  {
    kind: 'MdxPage',
    name: 'kb',
    route: '/kb',
    frontMatter: { title: '📚 Knowledge Base' },
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
        name: 'index',
        route: '/ai-research',
        frontMatter: { title: '🔬 AI Research' },
      },
      {
        kind: 'MdxPage',
        name: 'manus',
        route: '/ai-research/manus',
        frontMatter: { title: '🤖 Manus AI Research' },
      },
    ],
  },
]

export default async function NextraLayout({ children }: { children: ReactNode }) {
  let pageMap: any[] = STATIC_PAGE_MAP

  try {
    const tree = await getNavTree()
    const dynamic = navTreeToPageMap(tree).filter(
      (item: any) =>
        item.name !== 'index' &&
        item.name !== 'genspark' &&
        item.name !== 'ai-research' &&
        item.name !== 'kb'
    )
    if (dynamic.length > 0) {
      pageMap = [...STATIC_PAGE_MAP, ...dynamic]
    }
  } catch {
    // Content directory not yet populated — static pages are enough
  }

  return (
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
          <a href="/kb" style={{ color: '#6b7280', textDecoration: 'none' }}>
            📚 Knowledge Base
          </a>
          <a href="/keystatic" style={{ color: '#6b7280', textDecoration: 'none' }}>
            ✏️ Admin Editor
          </a>
        </div>
      }
    >
      {children}
    </Layout>
  )
}
