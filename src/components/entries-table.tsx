'use client'

import { ShapeIcon } from './shape-icon'
import { Button } from './ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './ui/empty'

/**
 * Entry type definition for shape entries
 */
type Entry = {
  id: string
  name: string
  shape: string
  color: string
  created_at: string
  created_by: string
}

/**
 * EntriesTable Component
 * 
 * Displays a responsive table of shape entries with conditional features based on user role.
 * - Admin users see edit and delete actions
 * - Regular users see a read-only view
 * - Shows empty state when no entries exist
 * 
 * @param {Object} props - Component props
 * @param {Entry[]} props.entries - Array of entry objects to display
 * @param {Function} [props.onEdit] - Callback fired when edit button is clicked (admin only)
 * @param {Function} [props.onDelete] - Callback fired when delete button is clicked (admin only)
 * @param {boolean} [props.isAdmin=false] - Whether to show admin actions (edit/delete buttons)
 * 
 * @returns {JSX.Element} Table component or empty state
 * 
 * @example
 * ```tsx
 * // Admin view with CRUD actions
 * <EntriesTable 
 *   entries={entries} 
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   isAdmin={true}
 * />
 * 
 * // User view (read-only)
 * <EntriesTable entries={entries} isAdmin={false} />
 * ```
 */
export function EntriesTable({
  entries,
  onEdit,
  onDelete,
  isAdmin = false,
}: {
  entries: Entry[]
  onEdit?: (entry: Entry) => void
  onDelete?: (id: string) => void
  isAdmin?: boolean
}) {
  if (!entries.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No entries yet</EmptyTitle>
          <EmptyDescription>
            {isAdmin ? 'Click "Add Entry" to create your first entry' : 'Entries will appear here when admins add them'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Shape</th>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Color</th>
            <th className="text-left p-3 font-medium">Created</th>
            {isAdmin && <th className="text-right p-3 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b hover:bg-muted/50">
              <td className="p-3">
                <ShapeIcon shape={entry.shape} color={entry.color} />
              </td>
              <td className="p-3">{entry.name}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded" style={{ backgroundColor: entry.color }} />
                  {entry.color}
                </div>
              </td>
              <td className="p-3 text-muted-foreground text-sm">
                {new Date(entry.created_at).toLocaleString()}
              </td>
              {isAdmin && (
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="icon-sm" variant="ghost" onClick={() => onEdit?.(entry)}>
                      <Pencil />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={() => onDelete?.(entry.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
