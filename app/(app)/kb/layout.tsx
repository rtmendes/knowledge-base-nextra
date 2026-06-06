import { getCategories } from '../../../lib/supabase-kb'
import { KBWorkspaceLayout } from '../../../components/kb/KBWorkspaceLayout'

export default async function KBLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()

  return (
    <KBWorkspaceLayout categories={categories}>
      {children}
    </KBWorkspaceLayout>
  )
}
