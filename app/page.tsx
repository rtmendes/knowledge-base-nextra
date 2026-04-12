import { redirect } from 'next/navigation'
import { reader } from '../lib/keystatic'

export default async function RootPage() {
  // Redirect to the first doc in the collection, sorted by order
  try {
    const docs = await reader.collections.docs.all()
    if (docs.length > 0) {
      const sorted = docs.sort((a, b) => (a.entry.order ?? 100) - (b.entry.order ?? 100))
      const first = sorted[0]
      // Navigate to root-level item or first folder index
      const topLevel = sorted.find((d) => !d.slug.includes('/'))
      redirect(`/${topLevel?.slug ?? first.slug}`)
    }
  } catch {
    // content dir not yet populated
  }
  redirect('/keystatic')
}
