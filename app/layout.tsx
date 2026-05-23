import './globals.css'
import type { ReactNode } from 'react'

/**
 * Root layout — intentionally minimal.
 *
 * Only <html> and <body> live here. Route-group-specific chrome
 * (chat assistant, enterprise shell, Nextra docs layout) belongs in the
 * group layouts so each section of the site gets only what it needs:
 *
 *   (nextra)/layout.tsx  → Nextra docs chrome
 *   (app)/layout.tsx     → KB app chrome (chat assistant + enterprise shell)
 *   (app)/keystatic/     → inherits (app) chrome  ← see note below
 *   app/keystatic/       → minimal (no chrome) — per Tech Spec §3
 */

export const metadata = {
  metadataBase: new URL('https://kb.insightprofit.live'),
  title: 'InsightProfit Knowledge Base — Operating System Documentation',
  description:
    'InsightProfit Knowledge Base centralizes product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'InsightProfit Knowledge Base — Operating System Documentation',
    description:
      'Product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
    url: 'https://kb.insightprofit.live/',
    siteName: 'InsightProfit Knowledge Base',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InsightProfit Knowledge Base — Operating System Documentation',
    description:
      'Product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
