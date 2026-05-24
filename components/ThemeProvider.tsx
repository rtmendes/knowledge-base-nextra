'use client'

/**
 * Thin wrapper around next-themes ThemeProvider so it can be imported
 * from a server-component layout (Server Components cannot import
 * next-themes directly because it uses React context).
 *
 * attribute="class"  → writes the "dark" class to <html>
 * defaultTheme="system" + enableSystem → respects OS dark-mode preference
 * disableTransitionOnChange → avoids a colour-flash on first paint
 */
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
