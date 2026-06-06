import { getItemTypeConfig } from '../../lib/supabase-kb'

interface Props {
  type: string
  size?: 'sm' | 'md'
}

export function ItemTypeBadge({ type, size = 'sm' }: Props) {
  const config = getItemTypeConfig(type)

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-3 py-1 text-xs gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.bgColor} ${config.color} ${sizeClasses}`}>
      <span className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  )
}
