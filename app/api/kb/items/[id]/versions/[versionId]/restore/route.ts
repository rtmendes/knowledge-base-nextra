import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../../../../lib/supabase'

export const dynamic = 'force-dynamic'

// POST /api/kb/items/[id]/versions/[versionId]/restore — restore a version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id: itemId, versionId } = await params

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // 1. Get the version to restore
    const { data: version, error: versionError } = await supabaseAdmin
      .from('knowledge_item_versions')
      .select('content, content_plain, word_count')
      .eq('id', versionId)
      .eq('item_id', itemId)
      .single()

    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // 2. Save current content as a new version first
    const { data: currentItem } = await supabaseAdmin
      .from('knowledge_items')
      .select('content, content_plain, word_count')
      .eq('id', itemId)
      .single()

    if (currentItem) {
      // Get latest version number
      const { data: latestVersion } = await supabaseAdmin
        .from('knowledge_item_versions')
        .select('version_number')
        .eq('item_id', itemId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (latestVersion?.version_number || 0) + 1

      await supabaseAdmin.from('knowledge_item_versions').insert({
        item_id: itemId,
        content: currentItem.content,
        content_plain: currentItem.content_plain,
        word_count: currentItem.word_count || 0,
        edited_by: 'auto-save before restore',
        version_number: nextVersion,
      })
    }

    // 3. Restore the version content to the item
    const now = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from('knowledge_items')
      .update({
        content: version.content,
        content_plain: version.content_plain,
        word_count: version.word_count,
        updated_at: now,
      })
      .eq('id', itemId)

    if (updateError) {
      console.error('[api/kb/versions/restore] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      content: version.content,
      word_count: version.word_count,
      updated_at: now,
    })
  } catch (err: any) {
    console.error('[api/kb/versions/restore] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
