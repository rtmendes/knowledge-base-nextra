import { notFound } from 'next/navigation'
import { reader } from '../../lib/keystatic'
import { DocRenderer } from '../../components/DocRenderer'
import { ShareBar } from '../../components/ShareBar'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
  try {
    const docs = await reader.collections.docs.all()
    console.log(`[keystatic] generateStaticParams: found ${docs.length} docs`)
    if (docs.length === 0) {
      console.warn('[keystatic] generateStaticParams: reader returned 0 docs — check content/docs/ files')
    }
    return docs.map((doc) => ({
      slug: doc.slug === 'index' ? [] : doc.slug.split('/'),
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

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const docSlug = slug?.join('/') || 'index'

  let doc
  try {
    doc = await reader.collections.docs.read(docSlug)
  } catch (err) {
    console.error(`[keystatic] Failed to read doc "${docSlug}":`, err)
    notFound()
  }

  if (!doc) notFound()

  const content = await doc.content()

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      {/* Title + meta */}
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
          {doc.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Cover image */}
      {doc.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={doc.coverImage}
          alt={doc.title}
          className="w-full rounded-xl mb-8 border border-gray-200 dark:border-gray-700"
        />
      )}

      {/* Rich text content */}
      <DocRenderer document={content} />

      {/* Share / download / source links */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <ShareBar
          title={doc.title}
          slug={docSlug}
          sourceUrl={doc.sourceUrl ?? undefined}
          shareUrl={doc.shareUrl ?? undefined}
        />
      </div>

      {/* Edit link */}
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
