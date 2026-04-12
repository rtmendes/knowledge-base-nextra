'use client'

interface VideoEmbedProps {
  url: string
  caption?: string
  autoplay?: boolean
}

function getEmbedUrl(url: string, autoplay = false): string | null {
  try {
    const u = new URL(url)

    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const videoId =
        u.searchParams.get('v') ??
        (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null)
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}rel=0`
      }
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}`
    }

    // Loom
    if (u.hostname.includes('loom.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://www.loom.com/embed/${id}`
    }

    // Genspark / Manus — embed directly
    if (u.hostname.includes('genspark.ai') || u.hostname.includes('manus.ai')) {
      return url
    }

    // Assume it's a direct video file (mp4, webm)
    return null
  } catch {
    return null
  }
}

export function VideoEmbed({ url, caption, autoplay }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url, autoplay)
  const isDirectVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)

  return (
    <figure className="my-6">
      <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-black"
           style={{ paddingTop: '56.25%' }}>
        {isDirectVideo ? (
          <video
            src={url}
            controls
            autoPlay={autoplay}
            className="absolute inset-0 w-full h-full"
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={caption || 'Embedded video'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Open video ↗
            </a>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
