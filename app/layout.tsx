import { Layout, Navbar } from 'nextra-theme-docs'
import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'InsightProfit Knowledge Base',
  description: 'InsightProfit Knowledge Base Documentation',
}

// Minimal hardcoded page map
const pageMap: any[] = [
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
]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          navbar={
            <Navbar
              logo={
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                  InsightProfit KB
                </span>
              }
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/rtmendes/knowledge-base-nextra"
          editLink={null}
          footer={
            <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              © 2026 Insight Profit
            </div>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
