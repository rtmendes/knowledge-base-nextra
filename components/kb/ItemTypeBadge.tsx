import { getItemTypeConfig } from '../../lib/supabase-kb'

interface Props {
  type: string
  size?: 'sm' | 'md'
}

export function ItemTypeBadge({ type, size = 'sm' }: Props) {
  const config = getItemTypeConfig(type)
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[11px]' 
    : 'px-2.5 py-1 text-xs'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
