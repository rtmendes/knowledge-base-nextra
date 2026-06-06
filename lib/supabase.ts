import { createClient } from '@supabase/supabase-js'

// Public fallbacks ensure the KB is readable even without env vars configured.
// The anon key is intentionally public (used client-side by all browsers).
const FALLBACK_URL = 'https://supabase.insightprofit.live'
const FALLBACK_ANON =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2ODcxMjQ0LCJleHAiOjIwODIyMzEyNDR9.qtJF1pWQQr-SGHVYLv0wP4hMiamqfjrNsfsnBm-c2hI'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Client-side Supabase client (uses anon key, respects RLS).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Server-side Supabase client.
 * Uses service role key when available (bypasses RLS, full access).
 * Falls back to anon key for public-read tables (knowledge_items, kb_categories).
 * Only for use in API routes / server components.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
)

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
