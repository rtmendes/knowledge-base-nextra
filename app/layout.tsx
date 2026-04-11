import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'InsightProfit Knowledge Base',
  description: 'Complete knowledge base for Insight Profit products and workflows'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pageMap = await getPageMap()
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          navbar={
            <Navbar logo={<span style={{ fontWeight: 'bold' }}>InsightProfit KB</span>} />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/rtmendes/knowledge-base-nextra"
          footer={
            <p style={{ textAlign: 'center', padding: '1rem' }}>
              © 2026 Insight Profit. All rights reserved.
            </p>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
