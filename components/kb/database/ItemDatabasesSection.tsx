'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { InlineDatabaseView } from './InlineDatabaseView'
import { CreateDatabaseButton } from './CreateDatabaseButton'

interface ItemDatabasesSectionProps {
  itemId: string
}

interface DatabaseSummary {
  id: string
  name: string
  view_type: string
  created_at: string
}

export function ItemDatabasesSection({ itemId }: ItemDatabasesSectionProps) {
  const [databases, setDatabases] = useState<DatabaseSummary[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDatabases = useCallback(async () => {
    try {
      const res = await fetch(`/api/kb/databases?parent_item_id=${itemId}`)
      if (res.ok) {
        const data = await res.json()
        setDatabases(data)
      }
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => { fetchDatabases() }, [fetchDatabases])

  const handleCreated = useCallback((newDbId: string) => {
    fetchDatabases()
  }, [fetchDatabases])

  if (loading) return null // Don't show loading state — it's a secondary section

  return (
    <div className="mt-8 space-y-6">
      {/* Render each inline database */}
      {databases.map((db) => (
        <InlineDatabaseView key={db.id} databaseId={db.id} />
      ))}

      {/* Create database button */}
      <CreateDatabaseButton parentItemId={itemId} onCreated={handleCreated} />
    </div>
  )
}
