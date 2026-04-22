import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'

// ── Local-storage reader for build & runtime ──────────────────────────────
// The main keystatic.config.tsx switches to GitHub storage when
// KEYSTATIC_GITHUB_CLIENT_ID is set (needed for the /keystatic admin UI).
// createReader REQUIRES storage: { kind: 'local' } to read from the
// filesystem. We spread the original config and override just the storage
// key — this avoids calling config() a second time with already-processed
// collection definitions, which can cause silent failures.
export const reader = createReader(process.cwd(), {
  ...keystaticConfig,
  storage: { kind: 'local' },
} as Parameters<typeof createReader>[1])

export type DocEntry = Awaited<ReturnType<typeof reader.collections.docs.read>>
export type ProjectEntry = Awaited<ReturnType<typeof reader.collections.projects.read>>
