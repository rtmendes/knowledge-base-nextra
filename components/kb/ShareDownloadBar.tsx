'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Props {
  itemId: string
  title: string
  content: string
  itemType?: string
}

export function ShareDownloadBar({ itemId, title, content, itemType }: Props) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/kb/item/${itemId}`
    : `/kb/item/${itemId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleDownloadMarkdown = () => {
    const slug = title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-|-$/g, '')
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowDropdown(false)
  }

  const handleDownloadHTML = () => {
    const slug = title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-|-$/g, '')
    // Get the rendered content from the page
    const rendered = document.querySelector('.kb-page-wrapper article')
    const htmlContent = rendered ? rendered.innerHTML : content

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — InsightProfit Knowledge Base</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e; line-height: 1.6; }
  h1 { font-size: 28px; border-bottom: 3px solid #7c5cfc; padding-bottom: 8px; }
  h2 { font-size: 20px; color: #7c5cfc; margin-top: 32px; border-left: 3px solid #7c5cfc; padding-left: 12px; }
  h3 { font-size: 16px; margin-top: 24px; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 14px; }
  th { background: #f0ecff; font-weight: 700; }
  tr:nth-child(even) td { background: #fafafa; }
  code { background: #f0ecff; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 24px 0; }
  .meta { font-size: 12px; color: #888; margin-bottom: 24px; }
  li { margin-bottom: 4px; }
  a { color: #7c5cfc; }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="meta">Type: ${itemType || 'document'} · Exported from InsightProfit Knowledge Base · ${new Date().toLocaleDateString()}</p>
${htmlContent}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.html`
    a.click()
    URL.revokeObjectURL(url)
    setShowDropdown(false)
  }

  const handlePrintPDF = () => {
    setShowDropdown(false)
    setTimeout(() => window.print(), 100)
  }

  const handleOpenNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Share / Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
          copied
            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
        title="Copy shareable link"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Link Copied!
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </>
        )}
      </button>

      {/* Open in new tab */}
      <button
        onClick={handleOpenNewTab}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        title="Open in new tab"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Open
      </button>

      {/* Download dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
          title="Download"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download
          <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
            <button
              onClick={handlePrintPDF}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <span className="text-base">📄</span>
              <div>
                <div className="font-medium text-xs">Save as PDF</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">via Print dialog</div>
              </div>
            </button>
            <button
              onClick={handleDownloadHTML}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <span className="text-base">🌐</span>
              <div>
                <div className="font-medium text-xs">Download HTML</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">Standalone web page</div>
              </div>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <span className="text-base">📝</span>
              <div>
                <div className="font-medium text-xs">Download Markdown</div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500">.md source file</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
