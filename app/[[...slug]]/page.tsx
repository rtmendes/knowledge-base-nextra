import { notFound } from 'next/navigation'
import { reader } from '../../lib/keystatic'
import { sanitizeDocument } from '../../lib/sanitize-document'
import { DocRenderer } from '../../components/DocRenderer'
import { ShareBar } from '../../components/ShareBar'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await reader.collections.docs.list()
    console.log(`[keystatic] generateStaticParams: found ${slugs.length} doc slugs`)
    return slugs.map((slug) => ({
      slug: slug === 'index' ? [] : slug.split('/'),
    }))
  } catch (err) {
    console.error('[keystatic] generateStaticParams FAILED:', err)
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const docSlug = slug?.join('/') || 'index'

  try {
    const doc = await reader.collections.docs.read(docSlug)
    if (!doc) return { title: 'Not Found' }
    return {
      title: `${doc.title} — InsightProfit KB`,
      description: doc.description || '',
    }
  } catch {
    return { title: 'InsightProfit KB' }
  }
}

function ContentFallback({ title, description, sourceUrl }: {
  title: string
  description?: string | null
  sourceUrl?: string | null
}) {
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-5">
        <p className="text-gray-600 dark:text-gray-400">
          ⚠️ This page&apos;s rich content could not be rendered.
          {sourceUrl && (
            <> View the <a href={sourceUrl} className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">original source</a>.</>
          )}
        </p>
      </div>
    </article>
  )
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const docSlug = slug?.join('/') || 'index'

  // 1. Read the doc entry
  let doc
  try {
    doc = await reader.collections.docs.read(docSlug)
  } catch (err) {
    console.error(`[keystatic] Failed to read doc "${docSlug}":`, err)
    notFound()
  }
  if (!doc) notFound()

  // 2. Parse + sanitize content
  let content: any[] | null = null
  try {
    const rawContent = await doc.content()
    content = sanitizeDocument(rawContent)
  } catch (err) {
    console.error(`[keystatic] Failed to parse content for "${docSlug}":`, err)
  }

  // 3. Pre-validate rendering — catch any DocRenderer crashes BEFORE
  //    returning JSX (which would crash the build if it throws).
  let renderSafe = false
  if (content) {
    try {
      renderToStaticMarkup(createElement(DocRenderer, { document: content }))
      renderSafe = true
    } catch (err) {
      console.error(`[keystatic] DocRenderer failed for "${docSlug}":`, err)
    }
  }

  // 4. Show fallback for pages that can't render
  if (!content || !renderSafe) {
    return (
      <ContentFallback
        title={doc.title}
        description={doc.description}
        sourceUrl={doc.sourceUrl}
      />
    )
  }

  // 5. Full render — guaranteed safe because pre-validated above
  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {doc.title}
        </h1>
        {doc.description && (
          <p className="text-lg text-gray-500 dark:text-gray-400">{doc.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {doc.status && doc.status !== 'active' && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              doc.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {doc.status === 'draft' ? '📝 Draft' : '📦 Archived'}
            </span>
          )}
          {doc.tags?.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {doc.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.coverImage}
          alt={doc.title}
          className="w-full rounded-xl mb-8 border border-gray-200 dark:border-gray-700"
        />
      )}

      <DocRenderer document={content} />

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <ShareBar
          title={doc.title}
          slug={docSlug}
          sourceUrl={doc.sourceUrl ?? undefined}
          shareUrl={doc.shareUrl ?? undefined}
        />
      </div>

      <div className="mt-4">
        <a
          href={`/keystatic/collection/docs/item/${encodeURIComponent(docSlug)}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          ✏️ Edit this page in the admin
        </a>
      </div>
    </article>
  )
}
