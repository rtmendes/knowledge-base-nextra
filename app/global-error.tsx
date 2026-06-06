'use client'

import { useEffect } from 'react'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[global-error] Unhandled app error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16">
          <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
            <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-200">
              The application hit a critical error
            </h2>
            <p className="mb-4 text-sm text-red-800/90 dark:text-red-300/90">
              A global error boundary intercepted this request so the server crash does not show a blank failure screen.
            </p>
            {error.digest && (
              <p className="mb-4 text-xs text-red-700 dark:text-red-400">Digest: {error.digest}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={() => reset()}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Retry
              </button>
              <a
                href="/"
                className="inline-flex items-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Go to homepage
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
