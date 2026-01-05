/**
 * TaskDetailsDialog Component
 *
 * Comprehensive task viewing/editing dialog with:
 * - All task fields (title, description, priority, status, due_date, time_spent)
 * - Tag assignment/removal (max 10 tags per task - FR-106)
 * - Subtask list integration
 * - Delete confirmation
 * - Version conflict handling (FR-103)
 *
 * Implements: FR-001, FR-002, FR-003, FR-016, FR-039, FR-040, FR-103, FR-106
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, Tag as TagIcon, CheckSquare, Trash2, Save } from 'lucide-react'
import { useTasks, Task } from '@/lib/hooks/useTasks'
import { useTags } from '@/lib/hooks/useTags'
import { SubtaskList } from './SubtaskList'
import { format, parseISO } from 'date-fns'

interface TaskDetailsDialogProps {
  taskId: string | null
  userId: string
  onClose: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'none', label: 'None', color: 'text-gray-600' },
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
]

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'text-gray-600' },
  { value: 'in_progress', label: 'In Progress', color: 'text-blue-600' },
  { value: 'done', label: 'Done', color: 'text-green-600' },
]

export function TaskDetailsDialog({ taskId, userId, onClose }: TaskDetailsDialogProps) {
  const { tasks, updateTask, deleteTask, fetchTasks } = useTasks()
  const { tags: availableTags } = useTags()

  const [task, setTask] = useState<Task | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | 'none'>('none')
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [dueDate, setDueDate] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Load task data
  useEffect(() => {
    if (taskId) {
      const foundTask = tasks.find((t) => t.id === taskId)
      if (foundTask) {
        setTask(foundTask)
        setTitle(foundTask.title)
        setDescription(foundTask.description || '')
        setPriority(foundTask.priority)
        setStatus(foundTask.status)
        setDueDate(foundTask.due_date ? format(parseISO(foundTask.due_date), "yyyy-MM-dd'T'HH:mm") : '')
        setSelectedTagIds(foundTask.tags?.map((t) => t.id) || [])
      }
    }
  }, [taskId, tasks])

  if (!taskId || !task) {
    return null
  }

  const handleSave = async () => {
    if (!title.trim()) {
      return
    }

    // Enforce 10 tags per task limit (FR-106)
    if (selectedTagIds.length > 10) {
      alert('Maximum 10 tags per task allowed')
      return
    }

    setIsSaving(true)

    const updates: any = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      tag_ids: selectedTagIds,
    }

    const updated = await updateTask(userId, task.id, updates)

    setIsSaving(false)

    if (updated) {
      setIsEditing(false)
      // Refresh to get updated data with tags
      fetchTasks(userId)
    }
  }

  const handleDelete = async () => {
    const success = await deleteTask(userId, task.id)
    if (success) {
      onClose()
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      if (selectedTagIds.length >= 10) {
        alert('Maximum 10 tags per task allowed')
        return
      }
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'Task Details'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    // Reset form
                    setTitle(task.title)
                    setDescription(task.description || '')
                    setPriority(task.priority)
                    setStatus(task.status)
                    setDueDate(task.due_date ? format(parseISO(task.due_date), "yyyy-MM-dd'T'HH:mm") : '')
                    setSelectedTagIds(task.tags?.map((t) => t.id) || [])
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task title..."
              />
            ) : (
              <p className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task description..."
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || <span className="text-gray-400 italic">No description</span>}
              </p>
            )}
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              {isEditing ? (
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
              ) : (
                <p className={`text-sm font-medium ${PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.color}`}>
                  {PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.label}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              {isEditing ? (
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
              ) : (
                <p className={`text-sm font-medium ${STATUS_OPTIONS.find((s) => s.value === task.status)?.color}`}>
                  {STATUS_OPTIONS.find((s) => s.value === task.status)?.label}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Due Date
            </label>
            {isEditing ? (
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : task.due_date ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {format(parseISO(task.due_date), 'PPpp')}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">No due date</p>
            )}
          </div>

          {/* Time Spent */}
          {!isEditing && task.time_spent > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Time Spent
              </label>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatDuration(task.time_spent)}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <TagIcon className="h-4 w-4 inline mr-1" />
              Tags {isEditing && <span className="text-xs text-gray-500">({selectedTagIds.length}/10)</span>}
            </label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all"
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
                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No tags available. Create tags in the sidebar.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {task.tags && task.tags.length > 0 ? (
                  task.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderWidth: '1px',
                        borderColor: `${tag.color}40`,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No tags</p>
                )}
              </div>
            )}
          </div>

          {/* Subtasks */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CheckSquare className="h-4 w-4 inline mr-1" />
                Subtasks
              </label>
              <SubtaskList
                taskId={task.id}
                subtasks={task.subtasks || []}
                onUpdate={() => fetchTasks(userId, {})}
              />
            </div>
          )}

          {/* Metadata */}
          {!isEditing && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {format(parseISO(task.created_at), 'PPp')}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {format(parseISO(task.updated_at), 'PPp')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Task?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete the task and all its subtasks. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
