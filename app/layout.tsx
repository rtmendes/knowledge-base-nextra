import './globals.css'
import type { ReactNode } from 'react'
import { Sidebar } from '../components/Sidebar'

export const metadata = {
  metadataBase: new URL('https://kb.insightprofit.live'),
  title: 'InsightProfit Knowledge Base',
  description: 'InsightProfit Knowledge Base Documentation',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-6 py-8 max-w-4xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
