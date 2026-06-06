'use client'

interface RawHTMLProps {
  html: string
  height?: number
  /** If true, renders in a sandboxed iframe instead of inline */
  iframe?: boolean
}

export function RawHTML({ html, height = 400, iframe = false }: RawHTMLProps) {
  if (iframe) {
    // Sandboxed iframe — safest for third-party HTML
    const blob = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    return (
      <div className="my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <iframe
          src={blob}
          style={{ width: '100%', height, border: 'none', display: 'block' }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          title="Embedded HTML"
        />
      </div>
    )
  }

  // Inline render — useful for styled HTML snippets inside docs
  return (
    <div
      className="my-4"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
