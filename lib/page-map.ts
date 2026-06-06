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
 * Maximum number of child pages to include in a single sidebar folder.
 * Folders that exceed this (e.g. genspark with 1181 pages) show only
 * the first N entries — the rest are accessible via browse/search.
 */
const MAX_SIDEBAR_CHILDREN = 25

/**
 * Builds the sidebar navigation tree from the Keystatic docs collection.
 * Large folders are capped at MAX_SIDEBAR_CHILDREN to prevent Nextra
 * Layout from crashing on 1000+ sidebar entries.
 */
export async function getNavTree(): Promise<NavItem[]> {
  const allDocs = await reader.collections.docs.all()
  console.log(`[keystatic] getNavTree: reader returned ${allDocs.length} docs`)

  const rootPages: NavItem[] = []
  const folders: Record<string, { index?: NavItem; children: NavItem[] }> = {}

  for (const doc of allDocs) {
    // Skip docs with missing or invalid data
    if (!doc.slug || !doc.entry?.title) continue

    const parts = doc.slug.split('/')
    const order = doc.entry.order ?? 100
    const title = String(doc.entry.title || doc.slug)

    if (parts.length === 1) {
      rootPages.push({
        name: doc.slug,
        route: `/${doc.slug}`,
        title,
        kind: 'MdxPage',
        order,
      })
    } else {
      const [folder] = parts
      const pageSlug = parts.slice(1).join('/')

      if (!folders[folder]) folders[folder] = { children: [] }

      if (pageSlug === 'index') {
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

  const result: NavItem[] = []

  for (const page of rootPages) {
    if (folders[page.name]) {
      const folder = folders[page.name]
      const sortedChildren = folder.children.sort((a, b) => a.order - b.order)
      const cappedChildren = sortedChildren.slice(0, MAX_SIDEBAR_CHILDREN)
      result.push({
        name: page.name,
        route: page.route,
        title: page.title,
        kind: 'Folder',
        order: folder.index?.order ?? page.order,
        children: [
          ...(folder.index ? [folder.index] : []),
          ...cappedChildren,
        ],
      })
      delete folders[page.name]
    } else {
      result.push(page)
    }
  }

  for (const [folderName, folderData] of Object.entries(folders)) {
    const sortedChildren = folderData.children.sort((a, b) => a.order - b.order)
    const cappedChildren = sortedChildren.slice(0, MAX_SIDEBAR_CHILDREN)
    result.push({
      name: folderName,
      route: `/${folderName}`,
      title: folderData.index?.title ?? folderName,
      kind: 'Folder',
      order: folderData.index?.order ?? 100,
      children: [
        ...(folderData.index ? [folderData.index] : []),
        ...cappedChildren,
      ],
    })
  }

  return result.sort((a, b) => a.order - b.order)
}

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
