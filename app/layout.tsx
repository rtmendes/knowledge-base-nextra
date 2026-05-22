import './globals.css'
import type { ReactNode } from 'react'
import { KBChatAssistant } from '../components/KBChatAssistant'
import { InsightProfitEnterpriseShell } from '../components/InsightProfitEnterpriseShell'

export const metadata = {
  metadataBase: new URL('https://knowledge-base-nextra.vercel.app'),
  title: 'InsightProfit Knowledge Base — Operating System Documentation',
  description:
    'InsightProfit Knowledge Base centralizes product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'InsightProfit Knowledge Base — Operating System Documentation',
    description:
      'Product documentation, AI research notes, SOPs, interactive tools, and implementation guidance for the InsightProfit ecosystem.',
    url: 'https://knowledge-base-nextra.vercel.app/',
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
      <body>
        {children}
        <KBChatAssistant />
        <InsightProfitEnterpriseShell appId="kb" />
      </body>
    </html>
  )
}
