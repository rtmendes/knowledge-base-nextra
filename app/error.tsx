'use client'

import { useEffect } from 'react'

type AppErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error('[app-error] Root segment error boundary:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-200">
          Something went wrong
        </h2>
        <p className="mb-4 text-sm text-red-800/90 dark:text-red-300/90">
          A server rendering error was caught by the app boundary. Please try the page again.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-red-700 dark:text-red-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
