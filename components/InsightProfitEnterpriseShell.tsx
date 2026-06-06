'use client'

import { useEffect } from 'react'
import { bootInsightProfitEnterpriseShell } from '../lib/insightprofit-enterprise-shell'

export function InsightProfitEnterpriseShell({ appId }: { appId: string }) {
  useEffect(() => {
    bootInsightProfitEnterpriseShell({ appId })
  }, [appId])

  return null
}
