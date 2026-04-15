'use client'
import { useState } from 'react'

interface ShareBarProps {
  title: string
  slug: string
  sourceUrl?: string
  shareUrl?: string
  markdownContent?: string
}

export function ShareBar({ title, slug, sourceUrl, shareUrl, markdownContent }: ShareBarProps) {
  const [copied, setCopied] = useState(false)

  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${slug}`
    : `https://kb.insightprofit.live/${slug}`

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadMarkdown() {
    const lines: string[] = [
      `# ${title}`,
      '',
      ...(sourceUrl ? [`**Source:** ${sourceUrl}`, ''] : []),
      ...(shareUrl ? [`**Share Link:** ${shareUrl}`, ''] : []),
      markdownContent || '_No content available_',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug.split('/').pop() || 'document'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-2 items-center not-prose">
      <button
        onClick={copyLink}
        title="Copy page link"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {copied ? '✓ Copied' : '🔗 Copy Link'}
      </button>

      <button
        onClick={downloadMarkdown}
        title="Download as Markdown"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        ⬇ Download .md
      </button>

      {shareUrl && (
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original share link"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ↗ Open Share Link
        </a>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original source"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ↗ Original Source
        </a>
      )}
    </div>
  )
}
