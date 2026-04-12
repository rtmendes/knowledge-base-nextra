import { Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'
import { getNavTree, navTreeToPageMap } from '../lib/page-map'

export const metadata = {
  title: 'InsightProfit Knowledge Base',
  description: 'Complete knowledge base for Insight Profit products and workflows',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Build sidebar from Keystatic content (falls back to empty if content dir missing)
  let pageMap: any[] = []
  try {
    const tree = await getNavTree()
    pageMap = navTreeToPageMap(tree)
  } catch {
    // Content directory not yet populated — provide minimal valid pageMap
    // IMPORTANT: Nextra v4's normalizePages does "data" in list[0] without
    // guarding against empty arrays, throwing TypeError when pageMap = [].
    pageMap = [{ kind: 'MdxPage' as const, name: 'index', route: '/', frontMatter: { title: 'Home' } }]
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
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
              }}
            >
              <span>© 2026 Insight Profit. All rights reserved.</span>
              <a
                href="/keystatic"
                style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                ✏️ Admin Editor
              </a>
            </div>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
