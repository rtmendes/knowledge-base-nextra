import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-6xl mb-4">📄</span>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Page Not Found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Try browsing the Knowledge Base or searching for what you need.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-500 transition-colors"
        >
          🏠 Home
        </Link>
        <Link
          href="/kb"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors"
        >
          📚 Browse KB
        </Link>
      </div>
    </div>
  )
}
