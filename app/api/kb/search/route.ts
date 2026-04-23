import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase.insightprofit.live';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const EMBED_URL = process.env.EMBED_SERVICE_URL || 'http://embed-service:8787';

export async function POST(request: Request) {
  try {
    const { query, category_id, limit = 10, threshold = 0.3 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string required' }, { status: 400 });
    }

    // 1. Generate embedding from self-hosted model
    const embedRes = await fetch(`${EMBED_URL}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [query] }),
    });
    
    if (!embedRes.ok) {
      return fallbackTextSearch(query, category_id, limit);
    }
    
    const { embeddings } = await embedRes.json();
    const queryEmbedding = embeddings[0];

    // 2. Search Supabase via RPC
    const searchRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_kb_by_embedding`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_embedding: JSON.stringify(queryEmbedding),
        match_count: limit,
        match_threshold: threshold,
        filter_category_id: category_id || null,
      }),
    });

    if (!searchRes.ok) {
      return fallbackTextSearch(query, category_id, limit);
    }

    const results = await searchRes.json();
    
    return NextResponse.json({
      results: results.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        item_type: r.item_type,
        category_id: r.category_id,
        summary: r.summary,
        word_count: r.word_count,
        similarity: r.similarity,
        preview: (r.content || '').substring(0, 300),
      })),
      search_type: 'semantic',
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

async function fallbackTextSearch(query: string, category_id: string | null, limit: number) {
  const params = new URLSearchParams({
    select: 'id,title,slug,item_type,category_id,summary,word_count',
    or: `(title.ilike.*${query}*,content_plain.ilike.*${query}*)`,
    status: 'eq.active',
    limit: String(limit),
    order: 'word_count.desc',
  });
  
  if (category_id) {
    params.set('category_id', `eq.${category_id}`);
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_items?${params}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const results = await res.json();
  
  return NextResponse.json({
    results: results.map((r: any) => ({
      ...r,
      similarity: null,
      preview: '',
    })),
    search_type: 'text_fallback',
    query,
  });
}
