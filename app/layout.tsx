import type { ReactNode } from 'react'

export const metadata = {
  title: 'Insight Profit Knowledge Base',
  description: 'Complete knowledge base for Insight Profit products and workflows'
}

export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
}
