interface CalloutProps {
  type: 'info' | 'warning' | 'success' | 'error' | 'note'
  title?: string
  body: string
}

const STYLES: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  info:    { bg: 'bg-blue-50 dark:bg-blue-950/40',   border: 'border-blue-400',   icon: '💡', label: 'Info' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-400',  icon: '⚠️', label: 'Warning' },
  success: { bg: 'bg-green-50 dark:bg-green-950/40', border: 'border-green-400',  icon: '✅', label: 'Success' },
  error:   { bg: 'bg-red-50 dark:bg-red-950/40',     border: 'border-red-400',    icon: '❌', label: 'Error' },
  note:    { bg: 'bg-gray-50 dark:bg-gray-800/60',   border: 'border-gray-400',   icon: '📌', label: 'Note' },
}

export function Callout({ type = 'info', title, body }: CalloutProps) {
  const s = STYLES[type] ?? STYLES.info
  return (
    <div className={`my-4 rounded-lg border-l-4 p-4 ${s.bg} ${s.border}`}>
      <p className="font-semibold text-sm mb-1">
        {s.icon} {title || s.label}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-line">{body}</p>
    </div>
  )
}
