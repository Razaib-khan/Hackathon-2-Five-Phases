/**
 * TagManager Component
 *
 * Manages user tags with:
 * - List of all tags with color indicators
 * - Create new tag dialog
 * - Edit tag (rename, change color)
 * - Delete tag with confirmation
 * - Color picker with preset colors
 * - 100 tag limit enforcement (FR-106)
 *
 * Implements: FR-016, FR-020, FR-021, FR-106
 */

'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { useTags } from '@/lib/hooks/useTags'

const PRESET_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#84CC16', // lime
]

export function TagManager() {
  const { tags, total, isLoading, createTag, updateTag, deleteTag } = useTags()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleCreate = async () => {
    if (!newTagName.trim()) return

    const success = await createTag({
      name: newTagName.trim(),
      color: newTagColor,
    })

    if (success) {
      setNewTagName('')
      setNewTagColor(PRESET_COLORS[0])
      setIsCreating(false)
    }
  }

  const startEdit = (tag: any) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  const handleUpdate = async (tagId: string) => {
    if (!editName.trim()) return

    const success = await updateTag(tagId, {
      name: editName.trim(),
      color: editColor,
    })

    if (success) {
      cancelEdit()
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('Delete this tag? It will be removed from all tasks.')) {
      return
    }

    await deleteTag(tagId)
  }

  const canCreateMore = total < 100

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
          <p className="text-sm text-gray-500">
            {total}/100 tags {!canCreateMore && '(limit reached)'}
          </p>
        </div>
        {canCreateMore && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Tag
          </button>
        )}
      </div>

      {/* Create New Tag Form */}
      {isCreating && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                {newTagName.length}/50 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: newTagColor === color ? '#000' : 'transparent',
                    }}
                  >
                    {newTagColor === color && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                  setNewTagColor(PRESET_COLORS[0])
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTagName.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      {isLoading && tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading tags...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tags yet. Create your first tag to organize tasks!
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {editingId === tag.id ? (
                <>
                  {/* Edit Mode */}
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={50}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className="w-6 h-6 rounded-full border-2"
                          style={{
                            backgroundColor: color,
                            borderColor: editColor === color ? '#000' : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-900">
                    {tag.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
