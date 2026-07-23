import { NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import {
  cosRegisterOnce,
  cosMemoryRetrieve,
  cosMemoryWrite,
  cosEvent,
  type CosMemoryItem,
} from '../../../../lib/cos-client'

// LLM gateway base — overridable so a `headroom proxy` (token-compression
// layer) can sit in front of every Chief-of-Staff LLM call without a code
// change (CHIEF_OF_STAFF_ENTERPRISE_ARCHITECTURE.md §4). Defaults to the
// exact URL previously hardcoded below.
const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'

// ── Types ─────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface KBSearchResult {
  id: string
  title: string
  item_type: string
  content_plain: string
  tags: string[]
  word_count: number
}

interface AppResult       { subdomain: string; name: string; hosting?: string; description?: string }
interface AgentResult     { name: string; status?: string; platform?: string; metadata?: string }
interface ToolResult      { tool_name: string; function_description?: string; login_page?: string }
interface OfferResult     { name?: string; description?: string; price_point?: string; offer_type?: string }
interface TaskResult      { id?: string; name?: string; text_content?: string; status?: string; url?: string }
interface CredentialResult{ service: string; deployed_locations?: string[] }

interface FederatedContext {
  kbItems:      KBSearchResult[]
  apps:         AppResult[]
  agents:       AgentResult[]
  tools:        ToolResult[]
  offers:       OfferResult[]
  tasks:        TaskResult[]
  credentials:  CredentialResult[]
}

// ── Helpers ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'i','me','my','we','us','our','you','your','he','him','his','she','her','it',
  'its','they','them','their','what','which','who','whom','this','that','these',
  'those','am','in','on','at','to','for','of','with','by','from','as','into',
  'through','during','before','after','above','below','between','out','off',
  'over','under','again','further','then','once','here','there','when','where',
  'why','how','all','both','each','few','more','most','other','some','such',
  'no','nor','not','only','own','same','so','than','too','very','just','about',
  'tell','know','find','get','give','go','help','look','make','need','say',
  'show','think','want','work','use','try','come','let','put','take','talk',
  'question','answer','information','please','thanks','thank','anything','everything',
])

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 8)
}

/**
 * Extract DISTINCT ENTITY GROUPS from the query. A group is one consecutive run
 * of non-stopword tokens — these represent semantically distinct concepts.
 *
 * "where are the design documents for family gift studio product images"
 *   → group 0: ["design documents"]
 *   → group 1: ["family gift studio", "gift studio product", "studio product images",
 *               "family gift studio product images"]
 *
 * `phrases` is the flat list (back-compat for ILIKE conditions).
 * `groups` is what we use for coverage scoring — an item that hits ≥2 groups
 * addresses BOTH concepts and is more relevant than one hitting either alone.
 */
function extractQuery(message: string): {
  phrases: string[]
  terms: string[]
  groups: string[][]
} {
  const raw = message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  // Find runs of consecutive non-stopword, length>2 tokens
  const runs: string[][] = []
  let run: string[] = []
  for (const w of raw) {
    if (STOP_WORDS.has(w) || w.length <= 2) {
      if (run.length >= 2) runs.push(run)
      run = []
    } else {
      run.push(w)
    }
  }
  if (run.length >= 2) runs.push(run)

  // For each run (= one concept), generate phrase variants.
  // Short run → just the full phrase. Long run → full phrase + 3-grams (covers
  // sub-entities like "Family Gift Studio" inside "Family Gift Studio product images").
  const groups: string[][] = runs.map(r => {
    if (r.length <= 4) return [r.join(' ')]
    const variants: string[] = [r.join(' ')]
    for (let i = 0; i <= r.length - 3; i++) {
      variants.push(r.slice(i, i + 3).join(' '))
    }
    return Array.from(new Set(variants))
  })

  const phrases = Array.from(new Set(groups.flat()))
  // Prefer longest phrases first when slicing
  phrases.sort((a, b) => b.split(' ').length - a.split(' ').length)

  const terms = raw.filter(w => w.length > 2 && !STOP_WORDS.has(w)).slice(0, 8)
  return { phrases: phrases.slice(0, 8), terms, groups }
}

/** Sanitize keyword for PostgREST ILIKE expressions (escape % and commas) */
function safeKw(kw: string): string {
  return kw.replace(/[%,()]/g, ' ').trim()
}

const EMBED_URL = process.env.EMBED_SERVICE_URL || 'https://embed.insightprofit.live'

/** Embed text via the internal embed service. Non-fatal — returns null on any failure. */
async function embedText(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${EMBED_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] }),
    })
    if (!res.ok) return null
    const { embeddings } = await res.json()
    return Array.isArray(embeddings?.[0]) ? embeddings[0] : null
  } catch {
    return null
  }
}

/**
 * Look up entities in kb_entities whose canonical OR aliases match any token
 * in the query, returning canonical names + their full alias lists. The route
 * then injects these as additional phrases — "fgs design docs" gets expanded
 * to also search for "Family Gift Studio".
 *
 * Falls back silently to [] if the table doesn't exist yet (pre-migration).
 *
 * @param terms Single-token lower-case keywords from the query
 * @returns Flat list of canonical names + aliases for matched entities
 */
async function expandEntities(
  terms: string[],
  phrases: string[],
): Promise<{ canonicals: string[]; expanded: string[]; matched: Array<{ canonical: string; description?: string }> }> {
  if (!supabaseAdmin) return { canonicals: [], expanded: [], matched: [] }
  if (terms.length === 0 && phrases.length === 0) return { canonicals: [], expanded: [], matched: [] }

  try {
    // Match by alias overlap OR canonical ILIKE on any phrase/term.
    // Two passes — array overlap (fast, indexed) then phrase ILIKE.
    const aliasMatches = await supabaseAdmin
      .from('kb_entities')
      .select('canonical, aliases, description, authority_score')
      .overlaps('aliases', terms)
      .order('authority_score', { ascending: false })
      .limit(8)

    let canonicalMatches: any = { data: [], error: null }
    if (phrases.length > 0) {
      const phraseConditions = phrases
        .map(p => `canonical.ilike.%${safeKw(p)}%`)
        .join(',')
      canonicalMatches = await supabaseAdmin
        .from('kb_entities')
        .select('canonical, aliases, description, authority_score')
        .or(phraseConditions)
        .order('authority_score', { ascending: false })
        .limit(8)
    }

    const rows = [
      ...(aliasMatches.data || []),
      ...(canonicalMatches.data || []),
    ]
    if (rows.length === 0) return { canonicals: [], expanded: [], matched: [] }

    // Dedupe by canonical
    const byCanon = new Map<string, { canonical: string; aliases: string[]; description?: string }>()
    for (const r of rows) {
      if (!byCanon.has(r.canonical)) {
        byCanon.set(r.canonical, {
          canonical: r.canonical,
          aliases: r.aliases || [],
          description: r.description,
        })
      }
    }

    const canonicals = Array.from(byCanon.keys())
    const expanded = Array.from(
      new Set(
        Array.from(byCanon.values()).flatMap(e => [e.canonical, ...e.aliases]),
      ),
    )
    const matched = Array.from(byCanon.values()).map(e => ({
      canonical: e.canonical,
      description: e.description,
    }))

    return { canonicals, expanded, matched }
  } catch (err) {
    // kb_entities table may not exist yet (pre-migration). Silent fallback.
    return { canonicals: [], expanded: [], matched: [] }
  }
}

/** Build PostgREST `.or()` condition string for given columns + keywords */
function buildOr(columns: string[], keywords: string[]): string {
  return keywords
    .flatMap(kw => columns.map(col => `${col}.ilike.%${safeKw(kw)}%`))
    .join(',')
}

/**
 * Score an item by:
 *   - phraseHits: how many phrases matched (raw count, n-grams counted)
 *   - groupsHit: how many DISTINCT entity groups matched (coverage signal)
 *   - score: weighted sum + huge coverage bonus when groupsHit >= 2
 *
 * Coverage matters more than density for multi-concept queries. Doc hitting
 * BOTH "family gift studio" AND "design documents" >> doc hitting only one.
 */
function scoreItem(
  text: string,
  title: string,
  phrases: string[],
  terms: string[],
  groups: string[][] = [],
): { score: number; phraseHits: number; groupsHit: number } {
  const t = title.toLowerCase()
  const c = text.toLowerCase()
  let score = 0
  let phraseHits = 0

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  for (const p of phrases) {
    const pre = new RegExp(escape(p), 'g')
    const titleHits = (t.match(pre) || []).length
    const contentHits = Math.min((c.match(pre) || []).length, 5)
    if (titleHits > 0 || contentHits > 0) phraseHits++
    score += titleHits * 100
    score += contentHits * 25
  }

  // Coverage: count distinct groups where ANY variant phrase matched
  let groupsHit = 0
  for (const group of groups) {
    let hit = false
    for (const variant of group) {
      const re = new RegExp(escape(variant), 'g')
      if (re.test(t) || re.test(c)) { hit = true; break }
    }
    if (hit) groupsHit++
  }

  // Bonuses by coverage — multi-group hits explode the score
  if (groups.length >= 2 && groupsHit >= 2) {
    // Item addresses MULTIPLE distinct concepts in the query — big boost
    score += 500 * (groupsHit - 1)
  } else if (groups.length >= 2 && groupsHit === 1) {
    // Hits only one of multiple concepts — penalty for tangential match
    score = Math.floor(score * 0.4)
  }

  for (const kw of terms) {
    const re = new RegExp(escape(kw), 'g')
    score += (t.match(re) || []).length * 3
    score += Math.min((c.match(re) || []).length, 10)
  }
  return { score, phraseHits, groupsHit }
}

// ── Individual Table Searches ─────────────────────────────────────────────
//
// Search strategy per table:
//   1. PHRASE PASS — try the longest phrases as ILIKE substring matches first.
//      These are high-signal entity matches ("family gift studio").
//   2. TERM FALLBACK — only if phrase pass returns nothing, fall back to
//      single-keyword OR.
//   3. SCORE + THRESHOLD — re-rank with phrase-weighted scoring, then drop
//      anything below a minimum score so the model never sees noise.

const KB_MIN_SCORE     = 30   // KB item must have at least one phrase hit OR many term hits
const APP_MIN_SCORE    = 25
const GENERIC_MIN_SCORE = 25

async function searchKBItems(
  query: string,
  phrases: string[],
  terms: string[],
  groups: string[][],
  limit = 5,
): Promise<KBSearchResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []

  // Ranked path: kb_hybrid_search RPC (RRF fusion of weighted FTS ts_rank_cd +
  // 384-dim vector cosine — the same ranked search that powers /api/kb/search).
  // This is real relevance ranking instead of keyword-substring/coverage
  // scoring, so it doesn't surface a document just because a phrase happens
  // to appear somewhere in it. Falls through to the legacy FTS/ILIKE path
  // below if the RPC is unavailable or returns nothing.
  try {
    const embedding = await embedText(query)
    const { data: hybridRows, error: hybridError } = await supabaseAdmin.rpc('kb_hybrid_search', {
      query_text: query,
      query_embedding: embedding ? JSON.stringify(embedding) : null,
      match_count: limit,
      filter_category_id: null,
    })
    if (!hybridError && Array.isArray(hybridRows) && hybridRows.length > 0) {
      const ids = hybridRows.map((r: any) => r.id)
      const { data: fullRows } = await supabaseAdmin
        .from('knowledge_items')
        .select('id, content_plain, tags')
        .in('id', ids)
      const byId = new Map((fullRows || []).map((r: any) => [r.id, r]))
      return hybridRows.map((r: any) => ({
        id: r.id,
        title: r.title,
        item_type: r.item_type,
        content_plain: (byId.get(r.id)?.content_plain || r.preview || r.summary || '').slice(0, 4000),
        tags: byId.get(r.id)?.tags || [],
        word_count: r.word_count,
      }))
    }
  } catch {
    // RPC not migrated yet — fall through to legacy path
  }

  // Fast path: Postgres FTS via search_knowledge_items_fts RPC.
  // Falls back to ILIKE if the RPC doesn't exist yet (pre-migration).
  let data: any[] = []
  try {
    // Build a tsquery-friendly string. websearch_to_tsquery handles natural
    // English so we just join the longest phrases with " OR " for recall —
    // ranking still favors items that hit multiple terms via ts_rank_cd.
    const ftsQuery = phrases.length > 0
      ? phrases.slice(0, 5).map(p => `"${p.replace(/"/g, '')}"`).join(' OR ')
      : terms.slice(0, 5).join(' OR ')

    const res = await supabaseAdmin.rpc('search_knowledge_items_fts', {
      q: ftsQuery,
      brand_filter: null,
      limit_n: limit * 4,
    })
    if (!res.error && res.data) data = res.data
  } catch {
    // RPC missing — fall through to ILIKE path
  }

  // ILIKE fallback (works pre-migration too) — Phrase pass first
  if (data.length === 0 && phrases.length > 0) {
    const phraseConditions = buildOr(['title', 'content_plain'], phrases)
    const res = await supabaseAdmin
      .from('knowledge_items')
      .select('id, title, item_type, content_plain, tags, word_count')
      .or(phraseConditions)
      .gt('word_count', 10)
      .order('word_count', { ascending: false })
      .limit(limit * 4)
    if (!res.error && res.data) data = res.data
  }

  // Fallback term pass only if both fast path AND phrase ILIKE returned nothing
  if (data.length === 0 && terms.length > 0) {
    const termConditions = buildOr(['title', 'content_plain'], terms)
    const res = await supabaseAdmin
      .from('knowledge_items')
      .select('id, title, item_type, content_plain, tags, word_count')
      .or(termConditions)
      .gt('word_count', 10)
      .order('word_count', { ascending: false })
      .limit(limit * 3)
    if (!res.error && res.data) data = res.data
  }

  if (data.length === 0) return []

  const ranked = data.map(item => {
    const { score, phraseHits, groupsHit } = scoreItem(
      item.content_plain || '',
      item.title || '',
      phrases,
      terms,
      groups,
    )
    let finalScore = score
    if (item.word_count > 500) finalScore += 1
    if (item.word_count > 2000) finalScore += 1
    return { ...item, score: finalScore, phraseHits, groupsHit }
  })

  // Coverage-aware filter:
  //  - Multi-concept query (groups.length >= 2): require groupsHit >= 2
  //    UNLESS the single-group score is extraordinarily high (title-level entity match).
  //  - Single-concept query: standard threshold.
  const multiGroup = groups.length >= 2
  const filtered = ranked.filter(r => {
    if (r.score < KB_MIN_SCORE) return false
    if (multiGroup) {
      if (r.groupsHit >= 2) return true
      // Allow groupsHit=1 only if title-level entity match (score >= 200)
      return r.score >= 200
    }
    // Single-concept query: phrase-or-strong-term gate
    if (phrases.length > 0 && r.phraseHits === 0 && r.score < KB_MIN_SCORE * 2) return false
    return true
  })

  // Rank by groupsHit first, then score
  filtered.sort((a, b) => {
    if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
    return b.score - a.score
  })

  return filtered.slice(0, limit).map(item => ({
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    content_plain: (item.content_plain || '').slice(0, 4000),
    tags: item.tags || [],
    word_count: item.word_count,
  }))
}

async function searchAppCatalog(phrases: string[], terms: string[], groups: string[][]): Promise<AppResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('app_catalog')
        .select('*')
        .or(buildOr(['name', 'subdomain'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('app_catalog')
        .select('*')
        .or(buildOr(['name', 'subdomain'], terms))
        .limit(8)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.name || ''} ${r.subdomain || ''} ${r.description || r.purpose || r.notes || ''}`
      const { score, phraseHits, groupsHit } = scoreItem(haystack, r.name || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit }
    })
    // Apps are entity-anchored — a name match alone is meaningful. Keep any phrase or group hit.
    const filtered = ranked.filter(x =>
      x.score >= APP_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0
    )
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r }) => ({
      subdomain: r.subdomain,
      name: r.name,
      hosting: r.hosting,
      description: r.description || r.purpose || r.notes,
    }))
  } catch { return [] }
}

async function searchAiAgents(phrases: string[], terms: string[], groups: string[][]): Promise<AgentResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('ai_agents')
        .select('name, status, platform, metadata')
        .or(buildOr(['name', 'metadata', 'platform'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('ai_agents')
        .select('name, status, platform, metadata')
        .or(buildOr(['name', 'metadata', 'platform'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const meta = typeof r.metadata === 'string' ? r.metadata : JSON.stringify(r.metadata || {})
      const haystack = `${r.name || ''} ${r.platform || ''} ${meta}`
      const { score, phraseHits, groupsHit } = scoreItem(haystack, r.name || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit, meta }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0)
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r, meta }) => ({
      name: r.name,
      status: r.status,
      platform: r.platform,
      metadata: meta.slice(0, 400),
    }))
  } catch { return [] }
}

async function searchTechTools(phrases: string[], terms: string[], groups: string[][]): Promise<ToolResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('tech_tools')
        .select('tool_name, function_description, login_page')
        .or(buildOr(['tool_name', 'function_description'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('tech_tools')
        .select('tool_name, function_description, login_page')
        .or(buildOr(['tool_name', 'function_description'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.tool_name || ''} ${r.function_description || ''}`
      const { score, phraseHits, groupsHit } = scoreItem(haystack, r.tool_name || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0)
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r }) => ({
      tool_name: r.tool_name,
      function_description: r.function_description,
      login_page: r.login_page,
    }))
  } catch { return [] }
}

async function searchOfferPipeline(phrases: string[], terms: string[], groups: string[][]): Promise<OfferResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    const colSets = [['name', 'description', 'offer_type'], ['name']]
    let data: any[] = []

    // Try phrase pass across column sets
    for (const cols of colSets) {
      if (data.length > 0 || phrases.length === 0) break
      const res = await supabaseAdmin
        .from('offer_pipeline')
        .select('*')
        .or(buildOr(cols, phrases))
        .limit(6)
      if (!res.error && res.data && res.data.length > 0) { data = res.data; break }
    }
    // Term fallback only if phrase pass came up dry
    if (data.length === 0 && terms.length > 0) {
      for (const cols of colSets) {
        const res = await supabaseAdmin
          .from('offer_pipeline')
          .select('*')
          .or(buildOr(cols, terms))
          .limit(8)
        if (!res.error && res.data) { data = res.data; break }
      }
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.name || ''} ${r.description || r.notes || ''} ${r.offer_type || ''}`
      const { score, phraseHits, groupsHit } = scoreItem(haystack, r.name || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0)
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r }) => ({
      name: r.name,
      description: r.description || r.notes,
      price_point: r.price_point,
      offer_type: r.offer_type,
    }))
  } catch { return [] }
}

async function searchClickupTasks(phrases: string[], terms: string[], groups: string[][]): Promise<TaskResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    const colSets = [['name', 'text_content'], ['name']]
    let data: any[] = []

    for (const cols of colSets) {
      if (data.length > 0 || phrases.length === 0) break
      const res = await supabaseAdmin
        .from('clickup_tasks')
        .select('*')
        .or(buildOr(cols, phrases))
        .limit(6)
      if (!res.error && res.data && res.data.length > 0) { data = res.data; break }
    }
    if (data.length === 0 && terms.length > 0) {
      for (const cols of colSets) {
        const res = await supabaseAdmin
          .from('clickup_tasks')
          .select('*')
          .or(buildOr(cols, terms))
          .limit(8)
        if (!res.error && res.data) { data = res.data; break }
      }
    }
    if (data.length === 0) return []

    // Filter out inactive tasks — Rashida uses 🟡 STALLED:/🔴 BLOCKED: prefixes
    // and also explicit status='closed'/'archived'/'done' rows. Surfacing those
    // as recommendations is misleading; an agent shouldn't cite zombie work.
    const INACTIVE_STATUSES = new Set(['closed', 'archived', 'done', 'cancelled', 'canceled', 'complete', 'completed'])
    const INACTIVE_TITLE_RX = /^[\s]*(🟡\s*stalled|🔴\s*blocked|⚫\s*archived|✅\s*done|❌\s*cancelled)\s*:/i
    const active = data.filter((r: any) => {
      if (INACTIVE_STATUSES.has(String(r.status || '').toLowerCase())) return false
      if (INACTIVE_TITLE_RX.test(r.name || '')) return false
      return true
    })
    if (active.length === 0) return []

    const ranked = active.map((r: any) => {
      const haystack = `${r.name || ''} ${r.text_content || r.description || ''}`
      const { score, phraseHits, groupsHit } = scoreItem(haystack, r.name || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0)
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r }) => ({
      id: r.id || r.task_id,
      name: r.name,
      text_content: (r.text_content || r.description || '').slice(0, 400),
      status: r.status,
      url: r.url,
    }))
  } catch { return [] }
}

async function searchCredentials(phrases: string[], terms: string[], groups: string[][]): Promise<CredentialResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    // Credentials: phrase pass then term pass
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('credential_registry')
        .select('service, deployed_locations')
        .or(buildOr(['service'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('credential_registry')
        .select('service, deployed_locations')
        .or(buildOr(['service'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const { score, phraseHits, groupsHit } = scoreItem(r.service || '', r.service || '', phrases, terms, groups)
      return { row: r, score, phraseHits, groupsHit }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0 || x.groupsHit > 0)
    filtered.sort((a, b) => {
      if (b.groupsHit !== a.groupsHit) return b.groupsHit - a.groupsHit
      return b.score - a.score
    })
    return filtered.slice(0, 5).map(({ row: r }) => r as CredentialResult)
  } catch { return [] }
}

/** Federated search across the enterprise platform.
 *
 * Two-step pipeline:
 *   1. Entity expansion — look up kb_entities for query tokens. "fgs" matches
 *      the alias list of Family Gift Studio and expands the search to include
 *      its canonical name + every other known alias.
 *   2. Federated search — run searches across all 7 tables with the expanded
 *      phrase set. Pass groups through for coverage scoring.
 */
async function federatedSearch(query: string): Promise<{
  context: FederatedContext
  phrases: string[]
  terms: string[]
  groups: string[][]
  matchedEntities: Array<{ canonical: string; description?: string }>
}> {
  const { phrases, terms, groups } = extractQuery(query)
  if (phrases.length === 0 && terms.length === 0) {
    return {
      context: { kbItems: [], apps: [], agents: [], tools: [], offers: [], tasks: [], credentials: [] },
      phrases, terms, groups, matchedEntities: [],
    }
  }

  // Step 1: entity expansion via kb_entities
  const { expanded, matched } = await expandEntities(terms, phrases)

  // Add expanded canonicals/aliases as a NEW group (so coverage scoring still
  // works) AND prepend them to phrases (so ILIKE+FTS see them). Cap total
  // phrases at 12 to keep PostgREST OR clauses reasonable.
  const enrichedPhrases = Array.from(new Set([...expanded, ...phrases])).slice(0, 12)
  const enrichedGroups: string[][] = expanded.length > 0
    ? [...groups, expanded.slice(0, 6)]
    : groups

  // Step 2: federated search
  const [kbItems, apps, agents, tools, offers, tasks, credentials] = await Promise.all([
    searchKBItems(query, enrichedPhrases, terms, enrichedGroups),
    searchAppCatalog(enrichedPhrases, terms, enrichedGroups),
    searchAiAgents(enrichedPhrases, terms, enrichedGroups),
    searchTechTools(enrichedPhrases, terms, enrichedGroups),
    searchOfferPipeline(enrichedPhrases, terms, enrichedGroups),
    searchClickupTasks(enrichedPhrases, terms, enrichedGroups),
    searchCredentials(enrichedPhrases, terms, enrichedGroups),
  ])

  return {
    context: { kbItems, apps, agents, tools, offers, tasks, credentials },
    phrases: enrichedPhrases,
    terms,
    groups: enrichedGroups,
    matchedEntities: matched,
  }
}

// ── Static Enterprise Ecosystem Context ───────────────────────────────────
//
// This block is injected into EVERY Chief of Staff turn as ground-truth
// knowledge of the InsightProfit ecosystem. Even if federated search returns
// nothing, the agent still knows:
//   - which 28 apps exist + where they live
//   - which repos are DEAD (must not be referenced)
//   - which Supabase tables exist + their exact column names
//   - which subdomains map to which functions
//
// Single source of truth: this mirrors knowledge-base-nextra/CLAUDE.md so the
// agent's "innate knowledge" of the company never drifts from the deployment
// map developers actually follow.
const ENTERPRISE_ECOSYSTEM = `
## InsightProfit Enterprise Map (28 production apps)

All apps deploy to subdomains of \`insightprofit.live\` from their respective
repos via Vercel. Apps are accessible without auth walls.

### Apps & Subdomains
- **Apex** — apex.insightprofit.live (repo: apex-deploy) — flagship growth platform
- **CloseFlow** — closeflow.insightprofit.live (repo: closeflow) — sales close + ops workflow
- **Customer Intelligence** — intel.insightprofit.live (repo: customer-intelligence-engine) — CI/research dashboard
- **Delta Jobs CRM** — jobs.insightprofit.live (repo: delta-jobs-crm) — recruiting / job pipeline
- **Design Inspiration** — design.insightprofit.live (repo: design-inspiration-curator) — design boards + curation
- **Digest HQ** — digest.insightprofit.live (repo: digest-hq) — daily content digest engine
- **EliteWriter** — elite-writer-app.insightprofit.live (repo: elite-writer-app) — long-form AI writing
- **Family Gift Studio (FGS)** — fgs.insightprofit.live (repo: fgs-product-suite) — POD/ecom brand for gifts; one of the active product lines
- **InsightProfit Academy** — academy.insightprofit.live (repo: insightprofit-academy) — training/courseware
- **Command Center v2** — command.insightprofit.live (repo: insightprofit-command-v2) — central ops hub; ALWAYS use v2, not v1
- **Creative** — creative.insightprofit.live (repo: insightprofit-creative) — creative asset workspace
- **Ecom** — ecom.insightprofit.live (repo: insightprofit-ecom) — ecommerce engine
- **Email Ops** — email.insightprofit.live (repo: insightprofit-emailops) — email marketing + dunning + lifecycle
- **Growth/Strategy** — strategy.insightprofit.live (repo: insightprofit-growth) — strategy docs/dashboards
- **Hub** — hub.insightprofit.live (repo: insightprofit-hub) — internal directory
- **Offers** — offers.insightprofit.live (repo: insightprofit-offers) — offer marketplace
- **Services** — services.insightprofit.live (repo: insightprofit-services) — service catalog
- **Knowledge Base** — kb.insightprofit.live (repo: knowledge-base-nextra) — THIS PROPERTY; Nextra docs + Chief of Staff
- **Offer Stack Engine** — offers.fundedfirst.com (repo: offer-stack-engine) — FundedFirst-branded offer stack
- **Product Board** — products.insightprofit.live (repo: product-board) — product roadmap
- **Research Platform** — research.insightprofit.live (repo: research-platform) — research workspace
- **Revenue Engine** — revenue.insightprofit.live (repo: revenue-engine) — revenue analytics
- **Second Spring** — secondspring.insightprofit.live (repo: second-spring-platform) — Second Spring product
- **Social Intelligence** — social.insightprofit.live (repo: social-intelligence-engine) — social listening
- **Sparky Studio** — sparky.insightprofit.live (repo: sparky-studio) — creative tooling
- **Tyber Sync** — tyber.insightprofit.live (repo: tyber-sync) — Tyber integration
- **VidRevamp** — vidrevamp.insightprofit.live (repo: vidrevamp) — video repurposing

### DEAD REPOS — never reference, never suggest (use successors)
- \`insightprofit-command\` (v1) → use **insightprofit-command-v2**
- \`insightprofit-kb\` → use **knowledge-base-nextra**
- \`offer-engine\` → use **insightprofit-offers** OR **offer-stack-engine**
- \`insightprofit-command-center\`, \`insightprofit-mission-control\` → use **insightprofit-command-v2**
- \`insight-profit-kb\` → use **knowledge-base-nextra**

### Supabase Schema (self-hosted at supabase.insightprofit.live)
Exact column names — if you cite a column not in this list, you are HALLUCINATING:
- **knowledge_items**: id, title, content, content_plain, item_type, tags, word_count
- **app_catalog**: subdomain, name, hosting (NO department)
- **ai_agents**: name, status, platform, metadata (NO entry_type, type, department)
- **tech_tools**: tool_name, function_description, login_page (NO name/description/url)
- **credential_registry**: service, deployed_locations (text[])
- **ai_expense_log**: provider, cost_usd, model (total_tokens is GENERATED — cannot insert)
- **clickup_tasks**: id, name, text_content, status, url (NO status_name, NO created_at)
- **offer_pipeline**: name, description, price_point (TEXT, not numeric)

### Active Product Lines (brands inside InsightProfit)
- Family Gift Studio (FGS) — print-on-demand gifting, jewelry bundles, lifestyle imagery
- Apex — growth platform
- EliteWriter — AI writing SaaS
- VidRevamp — video repurposing SaaS
- Second Spring — life transition product
- FundedFirst — offer stack (lives at offers.fundedfirst.com)
- SKYWARD OS — Rashida's command OS
`

// ── Prompt Builder ────────────────────────────────────────────────────────

interface PageContext {
  title?: string
  url?: string
  itemId?: string
}

function buildSystemPrompt(
  ctx: FederatedContext,
  phrases: string[],
  terms: string[],
  matchedEntities: Array<{ canonical: string; description?: string }>,
  pageContext?: PageContext,
  cosMemory: CosMemoryItem[] = [],
): string {
  const blocks: string[] = []
  const totalHits =
    ctx.kbItems.length + ctx.apps.length + ctx.agents.length +
    ctx.tools.length + ctx.offers.length + ctx.tasks.length + ctx.credentials.length

  const entityBlock = matchedEntities.length > 0
    ? `\n## Matched Enterprise Entities (from kb_entities dictionary)\n` +
      matchedEntities.map(e =>
        `- **${e.canonical}**${e.description ? ` — ${e.description}` : ''}`,
      ).join('\n') + '\n' +
      `\nUse these as canonical references when answering. If a user asked using an alias (e.g. "fgs"), respond using the canonical name (e.g. "Family Gift Studio") and mention the alias in passing if helpful.\n`
    : ''

  const queryDebug = `\n## Query Analysis\n- Detected phrases: ${phrases.length ? phrases.map(p => `"${p}"`).join(', ') : '(none)'}\n- Single terms: ${terms.length ? terms.join(', ') : '(none)'}\n- Matched entities: ${matchedEntities.length ? matchedEntities.map(e => e.canonical).join(', ') : '(none)'}\n- Total qualified matches across enterprise tables: ${totalHits}\n${entityBlock}`

  if (ctx.kbItems.length > 0) {
    let b = '\n## Relevant Knowledge Base Items\n\n'
    for (const item of ctx.kbItems) {
      b += `### [${item.title}](/kb/item/${item.id})\n`
      b += `Type: ${item.item_type} | Tags: ${item.tags.join(', ') || 'none'}\n`
      b += `Content:\n${item.content_plain}\n\n---\n\n`
    }
    blocks.push(b)
  }

  if (ctx.apps.length > 0) {
    let b = '\n## Enterprise Apps (app_catalog)\n\n'
    for (const a of ctx.apps) {
      const url = a.subdomain ? `https://${a.subdomain}.insightprofit.live` : ''
      b += `- **${a.name}** — ${url}${a.hosting ? ` · hosted on ${a.hosting}` : ''}${a.description ? `\n  ${a.description}` : ''}\n`
    }
    blocks.push(b)
  }

  if (ctx.agents.length > 0) {
    let b = '\n## AI Agents (ai_agents)\n\n'
    for (const a of ctx.agents) {
      b += `- **${a.name}**${a.status ? ` (${a.status})` : ''}${a.platform ? ` · platform: ${a.platform}` : ''}\n`
      if (a.metadata) b += `  metadata: ${a.metadata}\n`
    }
    blocks.push(b)
  }

  if (ctx.tools.length > 0) {
    let b = '\n## Tech Stack Tools (tech_tools)\n\n'
    for (const t of ctx.tools) {
      b += `- **${t.tool_name}**${t.login_page ? ` — [login](${t.login_page})` : ''}\n`
      if (t.function_description) b += `  ${t.function_description}\n`
    }
    blocks.push(b)
  }

  if (ctx.offers.length > 0) {
    let b = '\n## Offers (offer_pipeline)\n\n'
    for (const o of ctx.offers) {
      b += `- **${o.name || 'Untitled offer'}**${o.price_point ? ` — ${o.price_point}` : ''}${o.offer_type ? ` · ${o.offer_type}` : ''}\n`
      if (o.description) b += `  ${o.description}\n`
    }
    blocks.push(b)
  }

  if (ctx.tasks.length > 0) {
    let b = '\n## ClickUp Tasks (clickup_tasks)\n\n'
    for (const t of ctx.tasks) {
      b += `- **${t.name || 'Untitled'}**${t.status ? ` [${t.status}]` : ''}${t.url ? ` — [open](${t.url})` : ''}\n`
      if (t.text_content) b += `  ${t.text_content}\n`
    }
    blocks.push(b)
  }

  if (ctx.credentials.length > 0) {
    let b = '\n## Credentials Registry (credential_registry)\n\n'
    for (const c of ctx.credentials) {
      b += `- **${c.service}**${c.deployed_locations?.length ? ` — deployed in: ${c.deployed_locations.join(', ')}` : ''}\n`
    }
    blocks.push(b)
  }

  const contextBlock = blocks.length > 0
    ? queryDebug + '\n' + blocks.join('\n')
    : queryDebug + `\n## No qualified matches in enterprise data

The federated search across knowledge_items, app_catalog, ai_agents, tech_tools, offer_pipeline, clickup_tasks, and credential_registry did NOT find any records that passed the relevance threshold for the detected phrases/terms.

CRITICAL: Do NOT fabricate sources or pretend you found something. Tell the user honestly:
1. You searched all 7 enterprise tables and found no qualifying matches.
2. Echo back the phrases you searched for so they can refine.
3. Suggest more specific entity names or a different table to look in.
4. Optionally offer to create a ClickUp task or a KB stub for the missing knowledge.
`

  const pageBlock = pageContext?.title ? `
## Current Page Context
The user is currently viewing: "${pageContext.title}"
${pageContext.url ? `URL: ${pageContext.url}` : ''}
${pageContext.itemId ? `KB Item ID: ${pageContext.itemId}` : ''}
When asked to summarize, edit, or improve "this page", refer to the above context.
` : ''

  // Central CoS memory (L2) — retrieved from the Chief of Staff's central
  // store (insightprofit-command-v2 /v1/memory/retrieve). This is what makes
  // this assistant a CLIENT of the one enterprise brain instead of a silo:
  // insight written by ANY app surfaces here too. Absent/empty when the CoS
  // is unreachable or not configured — never blocks the turn.
  const cosMemoryBlock = cosMemory.length > 0
    ? `
## Central Chief-of-Staff Memory (enterprise L2 recall)
Cross-app memory retrieved from the central CoS for this query. Treat as additional enterprise context — cite it as "central CoS memory" (no per-item links).

${cosMemory.map(m => `- ${m.content.slice(0, 600)}${typeof m.metadata?.title === 'string' ? ` _(“${m.metadata.title}”)_` : ''}`).join('\n')}
`
    : ''

  return `You are **Chief of Staff** — the AI orchestrator for the InsightProfit enterprise platform.

## Your Role
- Senior operations Chief of Staff with full visibility into the entire InsightProfit enterprise — the Knowledge Base AND every connected database table (apps, agents, tools, offers, tasks, credentials).
- You answer "where is X" / "what is X" / "who owns X" / "how do we do X" by drawing on ALL the data sources surfaced below.
- You bridge KB knowledge to the broader InsightProfit tool suite and live apps.
- You are proactive: suggest next steps, identify gaps, and connect related information across data sources.

## Innate Enterprise Knowledge (always true, regardless of search results)
${ENTERPRISE_ECOSYSTEM}

## Enterprise Data Sources Available (this turn)
The blocks below are the result of a federated keyword search across the live Supabase enterprise data. Treat them as the authoritative current state. Pair them with the Innate Enterprise Knowledge above when answering.
${pageBlock}${cosMemoryBlock}${contextBlock}

## Response Format
- Use clear markdown: headers, bullet points, bold for key terms.
- Cite KB items as [Title](/kb/item/ID) — always link, never just mention.
- When referencing an app, link its live subdomain from the Innate Enterprise Map (e.g. https://fgs.insightprofit.live for Family Gift Studio).
- When referencing a tool, link its login_page when known.
- End with a concrete "Next Steps" or suggested action when appropriate.

## Instructions
- Prioritize the enterprise data blocks above when answering — they are this turn's ground truth.
- If the user asks "where are the design documents for X" where X is a known brand from the Innate Enterprise Map: name the app, give its live subdomain, AND check KB / catalog / tasks for design docs. Don't reply with only one of those.
- If NO search blocks contain matches BUT the query mentions a known brand or app (from the Innate Enterprise Map): use that map to give the user the live URL, repo name, and what category the asset would live under — then suggest a more specific search term.
- If NO blocks contain matches AND nothing matches the Innate Enterprise Map: say so honestly and suggest (a) different search terms, (b) which database tables likely hold the answer, (c) a Command Center / ClickUp action to capture the gap.
- For cross-app actions (ClickUp tasks, Command Center items), format them as copy-pasteable bullets the user can act on.
- NEVER reference a DEAD REPO. If the user mentions one, redirect them to the successor.
- NEVER fabricate columns or table names — use only those in the Supabase Schema above.
- Never fabricate — if a data source is empty, say so.`
}

// ── Route Handler ─────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────
// Conversation persistence
// ──────────────────────────────────────────────────────────────────────────
// Auto-save every chat to cos_conversations + cos_messages so the user can
// browse past chats at /chief-of-staff/history and convert them into KB notes
// or ClickUp tasks. Silent fallback if tables/columns missing — never blocks
// the streaming reply.

/** Find or create the conversation, write the user message. Returns conv id. */
async function ensureConversationAndLogUser(
  sessionId: string,
  userContent: string,
  isFirstMessage: boolean,
): Promise<string | null> {
  if (!supabaseAdmin) return null
  try {
    // Try to find existing conversation
    const { data: existing } = await supabaseAdmin
      .from('cos_conversations')
      .select('id, message_count')
      .eq('session_id', sessionId)
      .maybeSingle()

    let conversationId: string
    if (existing) {
      conversationId = existing.id
      await supabaseAdmin
        .from('cos_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          message_count: (existing.message_count || 0) + 1,
        })
        .eq('id', conversationId)
    } else {
      // First turn — derive a title from the user's question (truncated)
      const title = userContent.length > 80
        ? userContent.slice(0, 77).replace(/\s+\S*$/, '') + '…'
        : userContent
      const { data: created, error } = await supabaseAdmin
        .from('cos_conversations')
        .insert({
          session_id: sessionId,
          title,
          summary: userContent.slice(0, 200),
          message_count: 1,
        })
        .select('id')
        .single()
      if (error || !created) return null
      conversationId = created.id
    }

    await supabaseAdmin.from('cos_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: userContent,
    })

    return conversationId
  } catch (err) {
    console.error('[kb-chat] ensureConversation failed:', err)
    return null
  }
}

/** Write the assistant message after streaming completes. */
async function logAssistantMessage(
  conversationId: string,
  content: string,
  sources: unknown[],
  matchedEntities: unknown[],
): Promise<void> {
  if (!supabaseAdmin) return
  try {
    await supabaseAdmin.from('cos_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content,
      sources,
      matched_entities: matchedEntities,
      model: 'openai/gpt-4o-mini',
    })
    await supabaseAdmin
      .from('cos_conversations')
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
  } catch (err) {
    console.error('[kb-chat] logAssistant failed:', err)
  }
}

// ── KB Write Tools ────────────────────────────────────────────────────────

const KB_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'kb_add',
      description: 'Create a new item in the Knowledge Base. Use when the user asks to add, save, capture, or create a KB page/note about a topic.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title for the new KB item' },
          content: { type: 'string', description: 'Markdown content for the item (can be detailed)' },
          item_type: { type: 'string', enum: ['sop', 'prd', 'inspiration', 'imported', 'agent', 'launch_plan'], description: 'Type of KB item' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Tags to apply to the item' },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'kb_update',
      description: 'Update the content of an existing KB item by ID.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: 'UUID of the KB item to update' },
          content: { type: 'string', description: 'New full markdown content for the item' },
        },
        required: ['item_id', 'content'],
      },
    },
  },
]

async function executeKbTool(
  name: string,
  argsRaw: string,
): Promise<{ success: boolean; id?: string; title?: string; url?: string; error?: string }> {
  if (!supabaseAdmin) return { success: false, error: 'DB not configured' }
  let args: Record<string, any>
  try { args = JSON.parse(argsRaw) } catch { return { success: false, error: 'Invalid tool arguments' } }

  if (name === 'kb_add') {
    // Pick the first active category as fallback
    let categoryId: string | null = null
    const { data: cats } = await supabaseAdmin
      .from('kb_categories')
      .select('id')
      .gt('item_count', 0)
      .order('item_count', { ascending: false })
      .limit(1)
    if (cats?.length) categoryId = cats[0].id

    if (!categoryId) return { success: false, error: 'No categories available' }

    const slug = (args.title as string)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 200)
    const content = String(args.content || '')
    const contentPlain = content.replace(/[#*_`[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .insert({
        user_id: '893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0',
        title: String(args.title).trim(),
        slug,
        item_type: args.item_type || 'imported',
        category_id: categoryId,
        content,
        content_plain: contentPlain,
        word_count: wordCount,
        status: 'active',
        tags: Array.isArray(args.tags) ? args.tags : [],
        metadata: {},
        created_at: now,
        updated_at: now,
      })
      .select('id, title')
      .single()

    if (error) return { success: false, error: error.message }
    try { await supabaseAdmin.rpc('increment_category_count', { cat_id: categoryId }) } catch { /* non-critical */ }
    return { success: true, id: data.id, title: data.title, url: `/kb/item/${data.id}` }
  }

  if (name === 'kb_update') {
    const content = String(args.content || '')
    const contentPlain = content.replace(/[#*_`[\]]/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = contentPlain.split(/\s+/).filter((w: string) => w.length > 0).length
    const { error } = await supabaseAdmin
      .from('knowledge_items')
      .update({ content, content_plain: contentPlain, word_count: wordCount, updated_at: new Date().toISOString() })
      .eq('id', String(args.item_id))
    if (error) return { success: false, error: error.message }
    return { success: true, id: String(args.item_id), url: `/kb/item/${args.item_id}` }
  }

  return { success: false, error: `Unknown tool: ${name}` }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, pageContext, sessionId } = body as {
      messages: ChatMessage[]
      pageContext?: PageContext
      sessionId?: string
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // One brain: announce this surface to the central CoS (memoized, no-op
    // when COS_URL/COS_TOKEN are unset) — never blocks the turn.
    void cosRegisterOnce()

    // Federated enterprise search (entity-expanded, phrase-first, coverage-scored)
    // + central CoS memory recall (L2), in parallel. The CoS leg is
    // timeout-bounded and returns [] on any failure, so chat latency and
    // behavior are unchanged when the CoS is unreachable or unconfigured.
    const [{ context: ctx, phrases, terms, matchedEntities }, cosMemory] = await Promise.all([
      federatedSearch(lastUserMessage.content),
      cosMemoryRetrieve(lastUserMessage.content, 5),
    ])

    const systemPrompt = buildSystemPrompt(ctx, phrases, terms, matchedEntities, pageContext, cosMemory)
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10),
    ]

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://kb.insightprofit.live',
        'X-Title': 'InsightProfit Chief of Staff',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: fullMessages,
        tools: KB_TOOLS,
        tool_choice: 'auto',
        stream: true,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[kb-chat] OpenRouter error:', response.status, errText)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Build a unified `sources` array for the UI from all federated hits.
    // Each source has a typed `url` so the widget renders a clickable pill that
    // routes to the RIGHT destination per source type:
    //   - KB items  → /kb/item/{id}            (internal Nextra page)
    //   - apps      → https://{subdomain}.insightprofit.live
    //   - tools     → tool.login_page (external app login)
    //   - tasks     → task.url (ClickUp task page)
    //   - agents    → /kb/agents?q={name}      (agents directory filter)
    //   - offers    → /kb/offers?q={name}
    //   - creds     → /kb/credentials?q={service}
    const sourcesPayload: Array<{
      id: string
      title: string
      item_type: string
      url: string
      external: boolean
    }> = [
      ...ctx.kbItems.map(r => ({
        id: r.id,
        title: r.title,
        item_type: r.item_type,
        url: `/kb/item/${r.id}`,
        external: false,
      })),
      ...ctx.apps.map(a => ({
        id: `app:${a.subdomain}`,
        title: `${a.name} (${a.subdomain}.insightprofit.live)`,
        item_type: 'app',
        url: a.subdomain ? `https://${a.subdomain}.insightprofit.live` : '#',
        external: true,
      })),
      ...ctx.agents.map(a => ({
        id: `agent:${a.name}`,
        title: a.name,
        item_type: 'agent',
        url: `/kb/agents?q=${encodeURIComponent(a.name)}`,
        external: false,
      })),
      ...ctx.tools.map(t => ({
        id: `tool:${t.tool_name}`,
        title: t.tool_name,
        item_type: 'tool',
        url: t.login_page || `/kb/tools?q=${encodeURIComponent(t.tool_name)}`,
        external: !!t.login_page,
      })),
      ...ctx.offers.map(o => ({
        id: `offer:${o.name || 'unknown'}`,
        title: o.name || 'Offer',
        item_type: 'offer',
        url: `/kb/offers?q=${encodeURIComponent(o.name || '')}`,
        external: false,
      })),
      ...ctx.tasks.map(t => ({
        id: `task:${t.id || t.name}`,
        title: t.name || 'Task',
        item_type: 'task',
        url: t.url || `/kb/tasks?q=${encodeURIComponent(t.name || '')}`,
        external: !!t.url,
      })),
      ...ctx.credentials.map(c => ({
        id: `cred:${c.service}`,
        title: c.service,
        item_type: 'credential',
        url: `/kb/credentials?q=${encodeURIComponent(c.service)}`,
        external: false,
      })),
    ]

    // Persist user message + ensure conversation row exists BEFORE streaming.
    // Capture conversationId so we can write the assistant message at the end.
    const conversationId = sessionId
      ? await ensureConversationAndLogUser(sessionId, lastUserMessage.content, messages.length === 1)
      : null

    let assistantBuffer = ''
    const stream = new ReadableStream({
      async start(controller) {
        // Send conversationId/sessionId first so the widget can persist it
        if (sessionId) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'session', sessionId, conversationId })}\n\n`)
          )
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: sourcesPayload })}\n\n`)
        )

        // Helper to relay a streaming OpenRouter response to the client
        const relayStream = async (resp: globalThis.Response) => {
          const rdr = resp.body!.getReader()
          let buf = ''
          while (true) {
            const { done, value } = await rdr.read()
            if (done) break
            buf += decoder.decode(value, { stream: true })
            const lines = buf.split('\n')
            buf = lines.pop() || ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              const d = trimmed.slice(6)
              if (d === '[DONE]') { controller.enqueue(encoder.encode('data: [DONE]\n\n')); continue }
              try {
                const parsed = JSON.parse(d)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  assistantBuffer += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`))
                }
              } catch { /* skip */ }
            }
          }
        }

        const reader = response.body!.getReader()
        let buffer = ''
        // Tool call accumulation
        let tcId = '', tcName = '', tcArgs = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              const data = trimmed.slice(6)
              if (data === '[DONE]') continue // handled after loop
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta
                if (!delta) continue

                // Collect tool call deltas
                if (delta.tool_calls?.length) {
                  const tc = delta.tool_calls[0]
                  if (tc.id) tcId = tc.id
                  if (tc.function?.name) tcName = tc.function.name
                  if (tc.function?.arguments) tcArgs += tc.function.arguments
                }

                // Regular content
                const content = delta.content
                if (content) {
                  assistantBuffer += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`))
                }
              } catch { /* skip */ }
            }
          }

          // After stream: handle tool call if present
          if (tcId && tcName && tcArgs) {
            const toolResult = await executeKbTool(tcName, tcArgs)

            // Emit a tool action event so the UI can show a card
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'tool_action', tool: tcName, result: toolResult })}\n\n`)
            )

            // Make second request to get the natural language confirmation
            const secondResp = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://kb.insightprofit.live',
                'X-Title': 'InsightProfit Chief of Staff',
              },
              body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                  ...fullMessages,
                  { role: 'assistant', content: null, tool_calls: [{ id: tcId, type: 'function', function: { name: tcName, arguments: tcArgs } }] },
                  { role: 'tool', tool_call_id: tcId, content: JSON.stringify(toolResult) },
                ],
                stream: true,
                temperature: 0.3,
                max_tokens: 500,
              }),
            })

            if (secondResp.ok) {
              await relayStream(secondResp)
            } else {
              const msg = toolResult.success
                ? `Done — created KB item "${toolResult.title}" at [/kb/item/${toolResult.id}](/kb/item/${toolResult.id}).`
                : `Sorry, I couldn't complete that: ${toolResult.error}`
              assistantBuffer += msg
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: msg })}\n\n`))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err) {
          console.error('[kb-chat] Stream error:', err)
        } finally {
          controller.close()
          if (conversationId && assistantBuffer) {
            void logAssistantMessage(conversationId, assistantBuffer, sourcesPayload, matchedEntities)
          }
          if (assistantBuffer) {
            // Central memory + self-learning loop (fire-and-forget, no-ops
            // without COS_URL/COS_TOKEN). The per-app chat stays local
            // (cos_conversations above); the DISTILLED exchange goes to the
            // central CoS store so every other surface can recall it.
            void cosMemoryWrite(
              'kb-chat',
              `Q: ${lastUserMessage.content.slice(0, 500)}\nA: ${assistantBuffer.slice(0, 1500)}`,
              {
                conversationId: conversationId ?? null,
                matchedEntities: matchedEntities.map(e => e.canonical),
                sources: sourcesPayload.length,
              },
            )
            void cosEvent('run.completed', {
              outcome: 'success',
              kind: 'kb-chat-turn',
              conversationId: conversationId ?? null,
            })
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[kb-chat] Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
