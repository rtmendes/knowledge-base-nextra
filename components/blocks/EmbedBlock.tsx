'use client'

interface EmbedBlockProps {
  url: string
  title?: string
  height?: number
}

export function EmbedBlock({ url, title, height = 600 }: EmbedBlockProps) {
  return (
    <figure className="my-6">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <iframe
          src={url}
          title={title || 'Embedded content'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; clipboard-write; encrypted-media; fullscreen"
          allowFullScreen
        />
      </div>
      {title && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {title}
        </figcaption>
      )}
    </figure>
  )
}
