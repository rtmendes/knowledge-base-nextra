import type { ReactNode } from 'react'
import { KBChatAssistant } from '../../components/KBChatAssistant'
import { InsightProfitEnterpriseShell } from '../../components/InsightProfitEnterpriseShell'
import { ThemeProvider } from '../../components/ThemeProvider'

/**
 * App-group layout: wraps all KB app routes (/kb, /import, home page, etc.)
 * with the ThemeProvider (dark/light mode), chat assistant, and enterprise
 * shell overlays.
 *
 * ThemeProvider is scoped here rather than the root layout to avoid
 * conflicting with the Nextra docs layout, which manages its own
 * next-themes instance for the (nextra) route group.
 *
 * Deliberately NOT used by the Keystatic admin — that route lives at
 * app/keystatic/ (outside this group) to keep the editor UI clean.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <KBChatAssistant />
      <InsightProfitEnterpriseShell appId="kb" />
    </ThemeProvider>
  )
}
