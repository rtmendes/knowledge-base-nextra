import Link from 'next/link'
import Image from 'next/image'
import type { KBCategory } from '../../lib/supabase-kb'
import { getCategoryIcon } from '../../lib/supabase-kb'

// Category cover image mapping — slug → image path
const CATEGORY_COVERS: Record<string, string> = {
  'pod-ecommerce': '/images/categories/print-on-demand.webp',
  'content-marketing': '/images/categories/content-marketing.webp',
  'youtube-social': '/images/categories/youtube-social.webp',
  'fitness-health': '/images/categories/fitness-health.webp',
  'subscribr': '/images/categories/youtube-social.webp',
  'genspark-projects': '/images/categories/ai-tools.webp',
  'ai-tools': '/images/categories/ai-tools.webp',
  'automation': '/images/categories/automation.webp',
  'parenting-family': '/images/categories/parenting-family.webp',
  'manus-ai-research': '/images/categories/ai-tools.webp',
  'business-strategy': '/images/categories/business-strategy.webp',
  'seo-digital-marketing': '/images/categories/seo-marketing.webp',
  'software-dev': '/images/categories/software-dev.webp',
  'science-tech': '/images/categories/science-tech.webp',
  'education-learning': '/images/categories/education.webp',
  'faith-spirituality': '/images/categories/faith-spirituality.webp',
  'beauty-fashion': '/images/categories/beauty-fashion.webp',
  'motivation-self-help': '/images/categories/faith-spirituality.webp',
  'legacy-planning': '/images/categories/business-strategy.webp',
  'wellness-coaching': '/images/categories/fitness-health.webp',
  'personal-finance': '/images/categories/personal-finance.webp',
  'real-estate-home': '/images/categories/business-strategy.webp',
  'food-lifestyle': '/images/categories/food-lifestyle.webp',
  'music-entertainment': '/images/categories/content-marketing.webp',
  'aviation-career': '/images/categories/science-tech.webp',
  'tech-stack': '/images/categories/software-dev.webp',
  'news-politics': '/images/categories/content-marketing.webp',
  'video-production': '/images/categories/youtube-social.webp',
}

// Tool logos — used as overlay badges on relevant categories
const TOOL_LOGOS: Record<string, { src: string; alt: string }[]> = {
  'subscribr': [
    { src: 'https://cdn.simpleicons.org/youtube/FF0000', alt: 'YouTube' },
  ],
  'automation': [
    { src: 'https://cdn.simpleicons.org/n8n/EA4B71', alt: 'n8n' },
  ],
  'software-dev': [
    { src: 'https://cdn.simpleicons.org/github/ffffff', alt: 'GitHub' },
    { src: 'https://cdn.simpleicons.org/vercel/ffffff', alt: 'Vercel' },
  ],
  'tech-stack': [
    { src: 'https://cdn.simpleicons.org/supabase/3ECF8E', alt: 'Supabase' },
    { src: 'https://cdn.simpleicons.org/docker/2496ED', alt: 'Docker' },
  ],
  'genspark-projects': [
    { src: 'https://cdn.simpleicons.org/openai/412991', alt: 'AI' },
  ],
  'ai-tools': [
    { src: 'https://cdn.simpleicons.org/openai/412991', alt: 'AI' },
  ],
}

interface Props {
  category: KBCategory
  compact?: boolean
  featured?: boolean
}

function getSafeImageSrc(src: string | undefined): string | null {
  if (!src) return null
  const trimmed = src.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function CategoryCard({ category, compact = false, featured = false }: Props) {
  const icon = getCategoryIcon(category.icon)
  const coverImage = getSafeImageSrc(CATEGORY_COVERS[category.slug])
  const logos = TOOL_LOGOS[category.slug]

  if (compact) {
    return (
      <Link
        href={`/kb/${category.slug}`}
        className="group flex items-center gap-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 px-4 py-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
      >
        <span className="text-lg opacity-40 group-hover:opacity-70 transition-opacity">{icon}</span>
        <span className="text-sm text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors truncate">
          {category.name}
        </span>
      </Link>
    )
  }

  // Featured card — larger with prominent cover image
  if (featured) {
    return (
      <Link
        href={`/kb/${category.slug}`}
        className="kb-fade-in group relative flex flex-col rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-400/50 dark:hover:border-amber-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5 hover:-translate-y-1"
      >
        {/* Cover image with overlay */}
        <div className="relative h-44 overflow-hidden">
          {coverImage ? (
            <>
              <Image
                src={coverImage}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
              {/* Color tint overlay */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{ backgroundColor: category.color || '#f59e0b' }}
              />
            </>
          ) : (
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}08 50%, transparent 100%)`,
              }}
            />
          )}

          {/* Floating icon badge */}
          <div className="absolute top-4 left-4 z-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg backdrop-blur-md"
              style={{
                backgroundColor: `${category.color}90`,
                border: `1px solid ${category.color}60`,
              }}
            >
              {icon}
            </div>
          </div>

          {/* Tool logos */}
          {logos && logos.length > 0 && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
              {logos.map((logo) => (
                <div key={logo.alt} className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center p-1 border border-white/10">
                  <img src={logo.src} alt={logo.alt} className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}

          {/* Bottom content on image */}
          <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors leading-tight drop-shadow-lg">
              {category.name}
            </h3>
            <span className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-white/90 tabular-nums border border-white/10">
              {category.item_count.toLocaleString()} items
            </span>
          </div>
        </div>

        {/* Bottom section with description */}
        <div className="p-4 bg-white dark:bg-gray-900/80 backdrop-blur-sm flex-1 flex flex-col">
          {category.description && (
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: category.color || '#f59e0b' }}
              />
              <span className="text-[11px] text-gray-400 dark:text-gray-500">Active</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors flex items-center gap-1">
              Explore
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // Standard card — with thumbnail strip
  return (
    <Link
      href={`/kb/${category.slug}`}
      className="kb-fade-in group relative flex flex-col rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-gray-200/40 dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden hover:-translate-y-0.5"
    >
      {/* Thumbnail strip at top */}
      <div className="relative h-24 overflow-hidden">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent opacity-80" />
            <div 
              className="absolute inset-0 opacity-10 mix-blend-overlay"
              style={{ backgroundColor: category.color || '#f59e0b' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${category.color}25 0%, ${category.color}08 60%, transparent 100%)`,
            }}
          />
        )}

        {/* Tool logo badges */}
        {logos && logos.length > 0 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
            {logos.map((logo) => (
              <div key={logo.alt} className="w-6 h-6 rounded-md bg-black/30 backdrop-blur-sm flex items-center justify-center p-0.5 border border-white/10">
                <img src={logo.src} alt={logo.alt} className="w-3.5 h-3.5" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 -mt-3 relative z-10">
        {/* Icon + Count row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-md ring-2 ring-white dark:ring-gray-900"
            style={{
              backgroundColor: `${category.color}20`,
              border: `1px solid ${category.color}30`,
            }}
          >
            {icon}
          </div>
          <span className="inline-flex items-center rounded-lg bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">
            {category.item_count.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {category.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color || '#f59e0b' }}
            />
            <span className="text-[11px] text-gray-400 dark:text-gray-600">
              {category.item_count > 0
                ? `${category.item_count.toLocaleString()} items`
                : 'Empty'}
            </span>
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1">
            Browse
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
