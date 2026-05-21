'use client'

export default function DocError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-8">
        <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mt-0">
          ⚠️ Page could not be rendered
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This page encountered an error during rendering. The content may need to be updated.
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </article>
  )
}
