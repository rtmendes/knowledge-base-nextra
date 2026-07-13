/**
 * Minimal cos-client for the Knowledge Base — makes the KB's "Chief of Staff"
 * assistant a CLIENT of the central CoS (insightprofit-command-v2), not a
 * second brain (CHIEF_OF_STAFF_ENTERPRISE_ARCHITECTURE.md §2/§9.2 — "one
 * brain, many surfaces").
 *
 * Talks to the live /v1 surface at os.insightprofit.live/api/v1 (Bearer
 * COS_TOKEN). Server-side only. Deliberately tiny TS mirror of the
 * @insightprofit/cos-client surface the KB needs (register, memory
 * write/retrieve, events, report) — the full package lives in the
 * insightprofit-os monorepo (PR #37) and isn't published yet.
 *
 * Safety model (matches COS_CLIENT_PACKAGE_SPEC.md §5):
 *   - COS_URL / COS_TOKEN come from env only — never hardcoded.
 *   - Missing config ⇒ every call is a silent no-op: the KB keeps working
 *     exactly as before, and a misconfigured deploy can't corrupt central
 *     state or add latency.
 *   - Retrieval is timeout-bounded so CoS slowness can never block a chat turn.
 */

const COS_APP_ID = 'kb'
const COS_DOMAIN = 'kb.insightprofit.live'
const RETRIEVE_TIMEOUT_MS = 2500
const WRITE_TIMEOUT_MS = 4000

export interface CosMemoryItem {
  id?: string
  content: string
  metadata?: Record<string, unknown>
}

function cosConfig(): { url: string; token: string } | null {
  const url = process.env.COS_URL
  const token = process.env.COS_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

export function cosEnabled(): boolean {
  return cosConfig() !== null
}

async function cosFetch(
  path: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Response | null> {
  const cfg = cosConfig()
  if (!cfg) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(`${cfg.url}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

let registered = false

/** Announce the KB to the CoS app registry — once per server instance. */
export async function cosRegisterOnce(): Promise<void> {
  if (registered || !cosEnabled()) return
  registered = true // even on failure, don't retry every request
  try {
    await cosFetch(
      '/v1/apps/register',
      { appId: COS_APP_ID, domain: COS_DOMAIN, modules: ['kb', 'chief-of-staff-chat'] },
      WRITE_TIMEOUT_MS,
    )
  } catch {
    // Best-effort — registration failure never affects the KB.
  }
}

/**
 * Retrieve central (L2) memory for a query — top-k, timeout-bounded.
 * Returns [] on any failure so callers can always spread the result.
 */
export async function cosMemoryRetrieve(query: string, k = 5): Promise<CosMemoryItem[]> {
  try {
    const res = await cosFetch(
      '/v1/memory/retrieve',
      { appId: COS_APP_ID, query, k },
      RETRIEVE_TIMEOUT_MS,
    )
    if (!res || !res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.items) ? (data.items as CosMemoryItem[]) : []
  } catch {
    return []
  }
}

/** Write a memory item to the CENTRAL store (agent_memory). Fire-and-forget. */
export async function cosMemoryWrite(
  scope: string,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await cosFetch(
      '/v1/memory',
      { appId: COS_APP_ID, scope, content, ...(metadata ? { metadata } : {}) },
      WRITE_TIMEOUT_MS,
    )
  } catch {
    // Fire-and-forget.
  }
}

/** Emit an app event (agent_logs; terminal run events also feed agent_metrics). */
export async function cosEvent(
  type: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    await cosFetch('/v1/events', { appId: COS_APP_ID, type, ...payload }, WRITE_TIMEOUT_MS)
  } catch {
    // Fire-and-forget.
  }
}

/** Report health/KPIs to the CoS (lights up the command-center tiles). */
export async function cosReport(
  status: string,
  metrics: Record<string, unknown> = {},
): Promise<void> {
  try {
    await cosFetch('/v1/report', { appId: COS_APP_ID, status, metrics }, WRITE_TIMEOUT_MS)
  } catch {
    // Fire-and-forget.
  }
}
