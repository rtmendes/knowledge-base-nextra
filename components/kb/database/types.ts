// ── Inline Database Types ────────────────────────────────────────────────────

export type ColumnType =
  | 'title'       // Main text field (one per database, opens as page)
  | 'text'        // Plain text
  | 'number'      // Numeric value
  | 'select'      // Single select dropdown
  | 'multi_select' // Multi-select tags
  | 'date'        // Date/datetime
  | 'checkbox'    // Boolean toggle
  | 'url'         // URL link
  | 'relation'    // Link to rows in another database
  | 'kb_link'     // Link to a knowledge_item

export interface ColumnDef {
  id: string
  name: string
  type: ColumnType
  width?: number
  options?: string[]           // For select / multi_select
  target_database_id?: string  // For relation type
}

export interface DatabaseRow {
  id: string
  database_id: string
  linked_item_id: string | null
  values: Record<string, any>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DatabaseRelation {
  id: string
  source_row_id: string
  target_row_id: string
  column_id: string
}

export interface InlineDatabase {
  id: string
  name: string
  description: string
  parent_item_id: string | null
  columns: ColumnDef[]
  view_type: 'table' | 'board' | 'list' | 'gallery'
  sort_config: any[]
  filter_config: any[]
  rows: DatabaseRow[]
  relations: DatabaseRelation[]
  created_at: string
  updated_at: string
}
