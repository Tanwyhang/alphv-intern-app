'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Field, FieldLabel, FieldGroup } from './ui/field'
import { useState, useEffect } from 'react'

/**
 * Entry type definition for the dialog
 */
type Entry = {
  id: string
  name: string
  shape: string
  color: string
}

/**
 * EntryDialog Component
 * 
 * A modal dialog for creating new entries or editing existing ones.
 * Features:
 * - Text input for entry name
 * - Dropdown selector for shape type
 * - Color picker with hex input
 * - Automatic form reset when opening/closing
 * - Pre-populates form when editing existing entry
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onOpenChange - Callback for dialog open/close state changes
 * @param {Entry | null} [props.entry] - Existing entry to edit (null for new entry)
 * @param {Function} props.onSave - Callback fired when form is submitted with validated data
 * 
 * @returns {JSX.Element} Dialog component with entry form
 * 
 * @example
 * ```tsx
 * // Create new entry
 * <EntryDialog 
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSave={handleCreate}
 * />
 * 
 * // Edit existing entry
 * <EntryDialog 
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   entry={selectedEntry}
 *   onSave={handleUpdate}
 * />
 * ```
 */
export function EntryDialog({
  open,
  onOpenChange,
  entry,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: Entry | null
  onSave: (data: { name: string; shape: string; color: string }) => void
}) {
  const [name, setName] = useState('')
  const [shape, setShape] = useState('circle')
  const [color, setColor] = useState('#000000')
  
  const shapes = ['box', 'circle', 'cone', 'cuboid', 'cylinder', 'diamond', 'heart', 'hexagon']

  useEffect(() => {
    if (entry) {
      setName(entry.name)
      setShape(entry.shape)
      setColor(entry.color)
    } else {
      setName('')
      setShape('circle')
      setColor('#000000')
    }
  }, [entry, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, shape, color })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Shape</FieldLabel>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {shapes.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex gap-2">
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-20" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} required />
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{entry ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
