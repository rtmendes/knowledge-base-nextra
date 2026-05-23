import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Layout for the Keystatic admin editor at /keystatic.
 *
 * Intentionally minimal: Keystatic's makePage() renders its own full SPA
 * UI, so we only need to provide correct metadata and no-index robots
 * directives. The Nextra Layout is explicitly NOT used here — this section
 * lives in the (app) route group to keep it isolated from the docs layout.
 */
export const metadata: Metadata = {
  title: 'InsightProfit KB — Admin Editor',
  description: 'Keystatic content editor for the InsightProfit Knowledge Base.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
