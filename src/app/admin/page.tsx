'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EntriesTable } from '@/components/entries-table'
import { EntryDialog } from '@/components/entry-dialog'
import { ShapesChart } from '@/components/shapes-chart'
import { ShapesTimelineChart } from '@/components/shapes-timeline-chart'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Entry = {
  id: string
  name: string
  shape: string
  color: string
  created_at: string
  created_by: string
}

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const supabase = createClient()

  async function loadEntries() {
    const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => {
    loadEntries()
    
    const channel = supabase
      .channel('entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => {
        loadEntries()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(data: { name: string; shape: string; color: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingEntry) {
      const { error } = await supabase.from('entries').update(data).eq('id', editingEntry.id)
      if (error) toast.error('Failed to update entry')
      else {
        toast.success('Entry updated')
        await loadEntries()
      }
    } else {
      const { data: newEntry, error } = await supabase.from('entries').insert({ ...data, created_by: user.id }).select().single()
      if (error) toast.error('Failed to create entry')
      else {
        await loadEntries()
        toast.success(`${data.shape} added`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              await supabase.from('entries').delete().eq('id', newEntry.id)
              await loadEntries()
            },
          },
        })
      }
    }

    setDialogOpen(false)
    setEditingEntry(null)
  }

  async function handleDelete(id: string) {
    const entry = entries.find(e => e.id === id)
    if (!entry) return

    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) toast.error('Failed to delete entry')
    else {
      await loadEntries()
      toast.success(`${entry.shape} deleted`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await supabase.from('entries').insert({ name: entry.name, shape: entry.shape, color: entry.color, created_by: entry.created_by })
            await loadEntries()
          },
        },
      })
    }
  }

  function handleEdit(entry: Entry) {
    setEditingEntry(entry)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditingEntry(null)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ShapesChart entries={entries} />
        <div className="md:col-span-2">
          <ShapesTimelineChart entries={entries} />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Entries Management</CardTitle>
          <CardDescription>Add, edit, and delete entries</CardDescription>
          <CardAction>
            <Button onClick={handleAdd}>
              <Plus />
              Add Entry
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <EntriesTable entries={entries} onEdit={handleEdit} onDelete={handleDelete} isAdmin />
        </CardContent>
      </Card>

      <EntryDialog open={dialogOpen} onOpenChange={setDialogOpen} entry={editingEntry} onSave={handleSave} />
    </div>
  )
}
