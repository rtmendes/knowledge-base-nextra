interface CardProps {
  icon?: string
  title: string
  description?: string
  href?: string
}

export function Card({ icon, title, description, href }: CardProps) {
  const inner = (
    <div className="group flex flex-col gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-4 h-full hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all">
      {icon && <span className="text-xl mb-1">{icon}</span>}
      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="no-underline">
        {inner}
      </a>
    )
  }
  return inner
}

interface CardGroupProps {
  cols?: number
  cards: CardProps[]
}

export function CardGroup({ cols = 2, cards }: CardGroupProps) {
  const colClass =
    cols === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : cols === 4
      ? 'grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid ${colClass} gap-3 my-4`}>
      {cards.map((card, i) => (
        <Card key={i} {...card} />
      ))}
    </div>
  )
}
