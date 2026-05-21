'use client'

import { useEffect } from 'react'

type RouteErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CatchAllRouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error('[route-error] app/[[...slug]]:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <h2 className="mb-2 text-xl font-semibold text-amber-900 dark:text-amber-200">
          This page failed to render
        </h2>
        <p className="mb-4 text-sm text-amber-800/90 dark:text-amber-300/90">
          We hit a route-level rendering issue, but the rest of the Knowledge Base is still available.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-amber-700 dark:text-amber-400">Digest: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          Retry page
        </button>
      </div>
    </div>
  )
}
