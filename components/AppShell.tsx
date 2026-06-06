'use client'
import type { ReactNode } from 'react'

// Auth removed — AppShell is now a pass-through wrapper
export function AppShell({ children }: { children: ReactNode }) {
  return <>{children}</>
}
