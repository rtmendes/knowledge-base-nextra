// Thin layout for the Keystatic admin route.
// Purpose: prevent Nextra's docs chrome from wrapping the editor UI,
// and block search engines from indexing the admin page.
//
// This layout does NOT include <html> or <body> — those come from
// the root app/layout.tsx. Next.js composes nested layouts automatically.
//
// This route lives at app/keystatic/ (OUTSIDE the (app) and (nextra)
// route groups) so it does NOT inherit the KBChatAssistant or
// InsightProfitEnterpriseShell overlays added by (app)/layout.tsx.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Keystatic Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function KeystaticLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
