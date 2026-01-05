/**
 * SubtaskList Component
 *
 * Displays and manages subtasks for a task with:
 * - List of subtasks with checkboxes
 * - Add new subtask inline
 * - Edit subtask title inline
 * - Delete subtask
 * - Reorder subtasks (drag-and-drop optional)
 * - Progress indicator (X/Y completed)
 * - 50 subtask limit enforcement (FR-106)
 *
 * Implements: FR-039, FR-040, FR-106
 */

'use client'

import React, { useState } from 'react'
import { Plus, X, GripVertical, Check } from 'lucide-react'
import { useSubtasks } from '@/lib/hooks/useSubtasks'

interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface SubtaskListProps {
  taskId: string
  subtasks: Subtask[]
  onUpdate: () => void // Callback to refresh parent task data
}

export function SubtaskList({ taskId, subtasks, onUpdate }: SubtaskListProps) {
  const { createSubtask, updateSubtask, deleteSubtask } = useSubtasks()

  const [isAdding, setIsAdding] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const completedCount = subtasks.filter((s) => s.completed).length
  const totalCount = subtasks.length
  const canAddMore = totalCount < 50

  const handleCreate = async () => {
    if (!newSubtaskTitle.trim()) return

    const success = await createSubtask(
      taskId,
      {
        task_id: taskId,
        title: newSubtaskTitle.trim(),
        order_index: totalCount,
      },
      totalCount
    )

    if (success) {
      setNewSubtaskTitle('')
      setIsAdding(false)
      onUpdate()
    }
  }

  const handleToggleComplete = async (subtask: Subtask) => {
    const success = await updateSubtask(subtask.id, {
      completed: !subtask.completed,
    })

    if (success) {
      onUpdate()
    }
  }

  const startEdit = (subtask: Subtask) => {
    setEditingId(subtask.id)
    setEditTitle(subtask.title)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleUpdate = async (subtaskId: string) => {
    if (!editTitle.trim()) return

    const success = await updateSubtask(subtaskId, {
      title: editTitle.trim(),
    })

    if (success) {
      cancelEdit()
      onUpdate()
    }
  }

  const handleDelete = async (subtaskId: string) => {
    const success = await deleteSubtask(subtaskId)

    if (success) {
      onUpdate()
    }
  }

  return (
    <div className="space-y-3">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">Subtasks</h3>
          {totalCount > 0 && (
            <span className="text-xs text-gray-500">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {canAddMore && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      {subtasks.length === 0 && !isAdding ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No subtasks yet. Break down this task into smaller steps!
        </p>
      ) : (
        <div className="space-y-1.5">
          {subtasks
            .sort((a, b) => a.order_index - b.order_index)
            .map((subtask) => (
              <div
                key={subtask.id}
                className="group flex items-center gap-2 p-2 rounded hover:bg-gray-50"
              >
                {/* Drag Handle (optional - not yet functional) */}
                <button className="opacity-0 group-hover:opacity-50 cursor-grab">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </button>

                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(subtask)}
                  className={`flex-shrink-0 h-4 w-4 rounded border-2 transition-colors ${
                    subtask.completed
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {subtask.completed && (
                    <Check className="h-full w-full text-white" strokeWidth={3} />
                  )}
                </button>

                {/* Title */}
                {editingId === subtask.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(subtask.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    maxLength={200}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => startEdit(subtask)}
                    className={`flex-1 text-left text-sm ${
                      subtask.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-900'
                    }`}
                  >
                    {subtask.title}
                  </button>
                )}

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  {editingId === subtask.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(subtask.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDelete(subtask.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add New Subtask Form */}
      {isAdding && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
          <div className="h-4 w-4" /> {/* Spacer for alignment */}
          <div className="h-4 w-4" /> {/* Spacer for checkbox */}
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewSubtaskTitle('')
              }
            }}
            placeholder="Subtask title..."
            maxLength={200}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!newSubtaskTitle.trim()}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setIsAdding(false)
              setNewSubtaskTitle('')
            }}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Limit Warning */}
      {!canAddMore && (
        <p className="text-xs text-amber-600 text-center">
          Maximum 50 subtasks per task reached
        </p>
      )}
    </div>
  )
}
