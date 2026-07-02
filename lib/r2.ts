/**
 * Cloudflare R2 object storage config for KB assets/attachments.
 *
 * Reuses the EXISTING bucket `elite-writer-media` (created 2026-06-11) under
 * the `kb/` key prefix — no new paid bucket. All values come from env vars;
 * never inline credentials here.
 *
 * Required env (Vercel + .env.local):
 *   R2_ACCOUNT_ID        — Cloudflare account id
 *   R2_ACCESS_KEY_ID     — R2 API token access key
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 * Optional:
 *   R2_BUCKET            — defaults to elite-writer-media
 *   R2_KB_PREFIX         — defaults to kb/
 *   R2_PUBLIC_BASE_URL   — public/custom-domain base URL if the bucket has one
 */

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  prefix: string
  endpoint: string
  publicBaseUrl: string | null
}

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) return null

  const bucket = process.env.R2_BUCKET || 'elite-writer-media'
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    prefix: process.env.R2_KB_PREFIX || 'kb/',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || null,
  }
}

/** Full object key for a KB asset: kb/<name> (prefix keeps KB files separate). */
export function kbObjectKey(name: string, config: R2Config): string {
  const clean = name.replace(/^\/+/, '')
  return clean.startsWith(config.prefix) ? clean : `${config.prefix}${clean}`
}
