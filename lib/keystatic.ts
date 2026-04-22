import { createReader } from '@keystatic/core/reader'
import { config } from '@keystatic/core'
import keystaticConfig from '../keystatic.config'

// ── Local-storage reader for build & runtime ──────────────────────────────
// Content files are committed to the git repo and available on the Vercel
// filesystem at both build time and runtime. The GitHub storage mode in
// keystatic.config.tsx is only needed for the admin CMS UI (/keystatic).
// By overriding storage to 'local', the reader can resolve all docs
// from the filesystem instead of hitting the GitHub API.
const localReaderConfig = config({
  storage: { kind: 'local' },
  collections: keystaticConfig.collections,
})

export const reader = createReader(process.cwd(), localReaderConfig)

export type DocEntry = Awaited<ReturnType<typeof reader.collections.docs.read>>
export type ProjectEntry = Awaited<ReturnType<typeof reader.collections.projects.read>>
