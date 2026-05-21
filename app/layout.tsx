import { Layout, Navbar } from 'nextra-theme-docs'
import './globals.css'
import type { ReactNode } from 'react'
import { getNavTree, navTreeToPageMap } from '../lib/page-map'
import { KBChatAssistant } from '../components/KBChatAssistant'
import { InsightProfitEnterpriseShell } from '../components/InsightProfitEnterpriseShell'

export const metadata = {
  metadataBase: new URL('https://knowledge-base-nextra.vercel.app'),
  title: 'InsightProfit Knowledge Base — Operating System Documentation',
  description: 'InsightProfit Knowledge Base centralizes product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'InsightProfit Knowledge Base — Operating System Documentation',
    description: 'Product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
    url: 'https://knowledge-base-nextra.vercel.app/',
    siteName: 'InsightProfit Knowledge Base',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsightProfit Knowledge Base — Operating System Documentation',
    description: 'Product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
  },
}

// ── Static pages that always appear in the sidebar ──────────────────────────
// These MUST include every App Router page/MDX route so Nextra can resolve
// them during static prerender (/_not-found, /genspark, /ai-research/manus etc.)
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Try to load additional Keystatic docs and merge them into the sidebar.
  // If Keystatic reader fails (no content yet, or reader error),
  // we still show the hardcoded pages above.
  let pageMap: any[] = STATIC_PAGE_MAP

  try {
    const tree = await getNavTree()
    const dynamic = navTreeToPageMap(tree).filter(
      // Remove any Keystatic entries that duplicate our static pages
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
                href="/kb"
                style={{ color: '#6b7280', textDecoration: 'none' }}
              >
                📚 Knowledge Base
              </a>
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
        <KBChatAssistant />
        <InsightProfitEnterpriseShell appId="kb" />
      </body>
    </html>
  )
}
