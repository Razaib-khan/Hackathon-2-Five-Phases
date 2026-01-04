/**
 * Enhanced Task Form Component
 *
 * Comprehensive task creation/editing with all fields:
 * - Title (required, max 200 chars)
 * - Description (optional, max 1000 chars)
 * - Priority (high/medium/low/none)
 * - Status (todo/in_progress/done)
 * - Due date (datetime-local picker)
 * - Tags (multi-select, max 10 - FR-106)
 * - Recurrence pattern (optional - FR-009, FR-010)
 * - Form validation
 * - Loading state
 *
 * Implements: FR-001, FR-002, FR-003, FR-008, FR-009, FR-010, FR-016, FR-106
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useTags } from '@/lib/hooks/useTags'
import { RecurrenceConfig } from './RecurrenceConfig'
import { X } from 'lucide-react'
import { format } from 'date-fns'

interface TaskFormData {
  title: string
  description?: string
  priority: 'high' | 'medium' | 'low' | 'none'
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string | null
  tag_ids?: string[]
  recurrence_pattern?: any | null
}

interface TaskFormEnhancedProps {
  initialData?: Partial<TaskFormData>
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'None', color: 'text-gray-600' },
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
]

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

export function TaskFormEnhanced({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: TaskFormEnhancedProps) {
  const { tags: availableTags } = useTags()

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | 'none'>(
    initialData?.priority || 'none'
  )
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(
    initialData?.status || 'todo'
  )
  const [dueDate, setDueDate] = useState(
    initialData?.due_date
      ? format(new Date(initialData.due_date), "yyyy-MM-dd'T'HH:mm")
      : ''
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tag_ids || [])
  const [recurrencePattern, setRecurrencePattern] = useState<any | null>(
    initialData?.recurrence_pattern || null
  )

  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less')
      return
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less')
      return
    }

    // Enforce 10 tags per task limit (FR-106)
    if (selectedTagIds.length > 10) {
      setError('Maximum 10 tags per task allowed')
      return
    }

    try {
      const data: TaskFormData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        tag_ids: selectedTagIds,
        recurrence_pattern: recurrencePattern,
      }

      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      if (selectedTagIds.length >= 10) {
        setError('Maximum 10 tags per task allowed')
        setTimeout(() => setError(''), 3000)
        return
      }
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="What needs to be done?"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          required
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{title.length}/200</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Add details..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description.length}/1000
        </p>
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags <span className="text-xs text-gray-500 dark:text-gray-400">({selectedTagIds.length}/10)</span>
        </label>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                    color: isSelected ? '#fff' : tag.color,
                    borderWidth: '1px',
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No tags available. Create tags in the sidebar.
          </p>
        )}
      </div>

      {/* Recurrence */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <RecurrenceConfig value={recurrencePattern} onChange={setRecurrencePattern} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : mode === 'edit' ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  )
}
