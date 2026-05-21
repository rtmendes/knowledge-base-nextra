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
 * Skips genspark-imported placeholder pages to keep sidebar manageable.
 */
export async function getNavTree(): Promise<NavItem[]> {
  const allDocs = await reader.collections.docs.all()
  console.log(`[keystatic] getNavTree: reader returned ${allDocs.length} docs`)

  // Filter out genspark placeholder pages — they clog the sidebar
  const docs = allDocs.filter((d) => !d.slug.startsWith('genspark/'))
  console.log(`[keystatic] getNavTree: after filtering genspark: ${docs.length} docs`)

  const rootPages: NavItem[] = []
  const folders: Record<string, { index?: NavItem; children: NavItem[] }> = {}

  for (const doc of docs) {
    const parts = doc.slug.split('/')
    const order = doc.entry.order ?? 100
    const title = doc.entry.title

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
