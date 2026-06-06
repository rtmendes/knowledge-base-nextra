interface FileAttachmentProps {
  url: string
  filename: string
  description?: string
  fileType?: string
}

const ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  xlsx: '📊',
  image: '🖼️',
  html: '🌐',
  md: '📋',
  other: '📎',
}

export function FileAttachment({ url, filename, description, fileType = 'other' }: FileAttachmentProps) {
  const icon = ICONS[fileType] ?? ICONS.other
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-3 flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline group"
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {filename}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{description}</p>
        )}
      </div>
      <span className="text-xs text-gray-400 uppercase shrink-0">{fileType}</span>
      <span className="text-gray-400 shrink-0">↗</span>
    </a>
  )
}
