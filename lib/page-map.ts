import { reader } from './keystatic'

export type NavItem = {
  name: string
  route: string
  title: string
  kind: 'MdxPage' | 'Folder'
  order: number
  children?: NavItem[]
}

/**
 * Builds the sidebar navigation tree from the Keystatic docs collection.
 * Top-level slugs like "insightprofit-popebot" become folders if sub-pages exist.
 * Sub-pages like "insightprofit-popebot/guide-to-ai-prompting" nest under them.
 */
export async function getNavTree(): Promise<NavItem[]> {
  const allDocs = await reader.collections.docs.all()

  const rootPages: NavItem[] = []
  const folders: Record<string, { index?: NavItem; children: NavItem[] }> = {}

  for (const doc of allDocs) {
    const parts = doc.slug.split('/')
    const order = doc.entry.order ?? 100
    const title = doc.entry.title

    if (parts.length === 1) {
      // Root-level page (no parent folder)
      rootPages.push({
        name: doc.slug,
        route: `/${doc.slug}`,
        title,
        kind: 'MdxPage',
        order,
      })
    } else {
      // Nested page: first segment = folder
      const [folder] = parts
      const pageSlug = parts.slice(1).join('/')

      if (!folders[folder]) folders[folder] = { children: [] }

      if (pageSlug === 'index') {
        // This is the index/landing page for the folder
        folders[folder].index = {
          name: 'index',
          route: `/${folder}`,
          title,
          kind: 'MdxPage',
          order,
        }
      } else {
        folders[folder].children.push({
          name: pageSlug,
          route: `/${doc.slug}`,
          title,
          kind: 'MdxPage',
          order,
        })
      }
    }
  }

  // Merge root pages that also have sub-pages into folder nodes
  const result: NavItem[] = []

  // Add pages that DON'T have a corresponding folder
  for (const page of rootPages) {
    if (folders[page.name]) {
      // Promote to folder
      const folder = folders[page.name]
      result.push({
        name: page.name,
        route: page.route,
        title: page.title,
        kind: 'Folder',
        order: folder.index?.order ?? page.order,
        children: [
          ...(folder.index ? [folder.index] : []),
          ...folder.children.sort((a, b) => a.order - b.order),
        ],
      })
      delete folders[page.name]
    } else {
      result.push(page)
    }
  }

  // Add folders that have no matching root page (index only)
  for (const [folderName, folderData] of Object.entries(folders)) {
    result.push({
      name: folderName,
      route: `/${folderName}`,
      title: folderData.index?.title ?? folderName,
      kind: 'Folder',
      order: folderData.index?.order ?? 100,
      children: [
        ...(folderData.index ? [folderData.index] : []),
        ...folderData.children.sort((a, b) => a.order - b.order),
      ],
    })
  }

  return result.sort((a, b) => a.order - b.order)
}

/**
 * Converts our NavTree into the Nextra PageMapItem format for the Layout component.
 */
export function navTreeToPageMap(tree: NavItem[]): any[] {
  return tree.map((item) => {
    if (item.kind === 'Folder' && item.children) {
      return {
        kind: 'Folder',
        name: item.name,
        route: item.route,
        children: navTreeToPageMap(item.children),
      }
    }
    return {
      kind: 'MdxPage',
      name: item.name,
      route: item.route,
      frontMatter: { title: item.title },
    }
  })
}
