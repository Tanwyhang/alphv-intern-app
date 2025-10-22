'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { EntriesTable } from '@/components/entries-table'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Entry = {
  id: string
  name: string
  shape: string
  color: string
  created_at: string
  created_by: string
}

export default function UserPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadEntries()
    
    const channel = supabase
      .channel('entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('New entry added')
        } else if (payload.eventType === 'UPDATE') {
          toast.info('Entry updated')
        } else if (payload.eventType === 'DELETE') {
          toast.error('Entry deleted')
        }
        loadEntries()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadEntries() {
    const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Entries</CardTitle>
          <CardDescription>Real-time view of all entries</CardDescription>
        </CardHeader>
        <CardContent>
          <EntriesTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}
