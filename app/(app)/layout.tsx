import type { ReactNode } from 'react'
import { KBChatAssistant } from '../../components/KBChatAssistant'
import { InsightProfitEnterpriseShell } from '../../components/InsightProfitEnterpriseShell'

/**
 * App-group layout: wraps all KB app routes (/kb, /import, home page, etc.)
 * with the chat assistant and enterprise shell overlays.
 *
 * Deliberately NOT used by the Keystatic admin — that route lives at
 * app/keystatic/ (outside this group) to keep the editor UI clean.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <KBChatAssistant />
      <InsightProfitEnterpriseShell appId="kb" />
    </>
  )
}
