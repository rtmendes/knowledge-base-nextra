import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'

// Singleton reader — created once per server process
export const reader = createReader(process.cwd(), keystaticConfig)

export type DocEntry = Awaited<ReturnType<typeof reader.collections.docs.read>>
export type ProjectEntry = Awaited<ReturnType<typeof reader.collections.projects.read>>
