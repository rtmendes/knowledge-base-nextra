import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Client-side Supabase client (uses anon key, respects RLS).
 * Only created if env vars are set.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/**
 * Server-side Supabase client (uses service role key, bypasses RLS).
 * Only for use in API routes / server components.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

/**
 * Upload a file buffer to Supabase Storage.
 * Bucket must exist and have appropriate policies.
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  if (!supabaseAdmin) {
    console.warn('Supabase not configured — skipping upload')
    return null
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('Supabase upload error:', error)
    return null
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

/**
 * Log an import event to the `imports` table.
 */
export async function logImport(record: {
  source: string
  url?: string
  slug: string
  title: string
  status: 'success' | 'error'
  error?: string
}) {
  if (!supabaseAdmin) return

  await supabaseAdmin.from('imports').insert({
    ...record,
    created_at: new Date().toISOString(),
  })
}
