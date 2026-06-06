import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, any> = {
    ts: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30) + '...' : 'undefined',
    },
  }

  // Test 1: import supabase client
  try {
    const { supabaseAdmin } = await import('../../../lib/supabase')
    results.supabaseAdmin = supabaseAdmin ? 'created' : 'null (env vars missing)'

    if (supabaseAdmin) {
      // Test 2: getCategories
      try {
        const { data, error } = await supabaseAdmin
          .from('kb_categories')
          .select('*')
          .order('sort_order', { ascending: true })
        results.categories = error ? 'error: ' + error.message : 'ok: ' + (data?.length || 0) + ' items'
      } catch (e: any) {
        results.categories = 'thrown: ' + e.message
      }

      // Test 3: getTotalStats
      try {
        const { count, error } = await supabaseAdmin
          .from('knowledge_items')
          .select('id', { count: 'exact', head: true })
        results.totalItems = error ? 'error: ' + error.message : 'ok: ' + count
      } catch (e: any) {
        results.totalItems = 'thrown: ' + e.message
      }

      // Test 4: word_count query
      try {
        const { count, error } = await supabaseAdmin
          .from('knowledge_items')
          .select('id', { count: 'exact', head: true })
          .gt('word_count', 0)
        results.withContent = error ? 'error: ' + error.message : 'ok: ' + count
      } catch (e: any) {
        results.withContent = 'thrown: ' + e.message
      }
    }
  } catch (e: any) {
    results.supabaseImport = 'thrown: ' + e.message
  }

  // Test 5: keystatic reader
  try {
    const { getNavTree } = await import('../../../lib/page-map')
    const tree = await getNavTree()
    results.keystatic = 'ok: ' + tree.length + ' nav items'
  } catch (e: any) {
    results.keystatic = 'thrown: ' + e.message
  }

  return NextResponse.json(results, { status: 200 })
}
