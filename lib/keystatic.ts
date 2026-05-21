import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'

// ── Local-storage reader for build & runtime ──────────────────────────────
// The main keystatic.config.tsx switches to GitHub storage when
// KEYSTATIC_GITHUB_CLIENT_ID is set (needed for the /keystatic admin UI).
// createReader REQUIRES storage: { kind: 'local' } to read from the
// filesystem. We spread the original config and override just the storage
// key — this avoids calling config() a second time with already-processed
// collection definitions, which can cause silent failures.
type ReaderInstance = ReturnType<typeof createReader>

const localReaderConfig = {
  ...keystaticConfig,
  storage: { kind: 'local' },
} as Parameters<typeof createReader>[1]

function createFallbackReader(): ReaderInstance {
  const emptyList = async () => [] as string[]
  const emptyAll = async () => [] as any[]
  const emptyRead = async () => null

  return {
    collections: {
      docs: {
        list: emptyList,
        all: emptyAll,
        read: emptyRead,
      },
      projects: {
        list: emptyList,
        all: emptyAll,
        read: emptyRead,
      },
    },
  } as unknown as ReaderInstance
}

function withSafeCollectionReads(baseReader: ReaderInstance): ReaderInstance {
  const docs = {
    ...baseReader.collections.docs,
    list: async () => {
      try {
        return await baseReader.collections.docs.list()
      } catch (error) {
        console.error('[keystatic] docs.list failed, returning []:', error)
        return []
      }
    },
    all: async () => {
      try {
        return await baseReader.collections.docs.all()
      } catch (error) {
        console.error('[keystatic] docs.all failed, returning []:', error)
        return []
      }
    },
    read: async (slug: string) => {
      try {
        return await baseReader.collections.docs.read(slug)
      } catch (error) {
        console.error(`[keystatic] docs.read failed for "${slug}", returning null:`, error)
        return null
      }
    },
  }

  const projects = {
    ...baseReader.collections.projects,
    list: async () => {
      try {
        return await baseReader.collections.projects.list()
      } catch (error) {
        console.error('[keystatic] projects.list failed, returning []:', error)
        return []
      }
    },
    all: async () => {
      try {
        return await baseReader.collections.projects.all()
      } catch (error) {
        console.error('[keystatic] projects.all failed, returning []:', error)
        return []
      }
    },
    read: async (slug: string) => {
      try {
        return await baseReader.collections.projects.read(slug)
      } catch (error) {
        console.error(`[keystatic] projects.read failed for "${slug}", returning null:`, error)
        return null
      }
    },
  }

  return {
    ...baseReader,
    collections: {
      ...baseReader.collections,
      docs,
      projects,
    },
  } as ReaderInstance
}

let safeReader = createFallbackReader()

try {
  const baseReader = createReader(process.cwd(), localReaderConfig) as ReaderInstance
  safeReader = withSafeCollectionReads(baseReader)
} catch (error) {
  console.error('[keystatic] reader initialization failed, using empty fallback:', error)
}

export const reader = safeReader

export type DocEntry = Awaited<ReturnType<typeof reader.collections.docs.read>>
export type ProjectEntry = Awaited<ReturnType<typeof reader.collections.projects.read>>
