'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Route-level error boundary for individual KB item pages.
 * Catches both server-component rendering errors and client-side React errors
 * (including hydration failures) and surfaces a user-friendly fallback.
 *
 * The useEffect logs the real error to the console so it appears in browser
 * devtools — useful for diagnosing content-specific rendering issues without
 * needing to reproduce them through Vercel runtime logs.
 */
export default function ItemError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console so the real error is visible in browser devtools
    console.error('[KB item render error]', error.message, error)
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20 p-10 text-center">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          This item couldn&apos;t be displayed
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          There was a problem rendering this knowledge item. The content may contain
          formatting that the viewer can&apos;t process.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
          >
            Try again
          </button>
          <Link
            href="/kb"
            className="px-5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back to Knowledge Base
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 text-xs text-gray-400 dark:text-gray-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
