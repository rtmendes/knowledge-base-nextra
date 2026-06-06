interface Step {
  title: string
  body: string
}

interface StepsProps {
  steps: Step[]
}

export function Steps({ steps }: StepsProps) {
  return (
    <ol className="relative my-6 ml-2 border-l-2 border-gray-200 dark:border-gray-700 list-none p-0">
      {steps.map((step, i) => (
        <li key={i} className="mb-6 ml-6">
          <span className="absolute -left-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold ring-4 ring-white dark:ring-gray-900">
            {i + 1}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{step.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  )
}
