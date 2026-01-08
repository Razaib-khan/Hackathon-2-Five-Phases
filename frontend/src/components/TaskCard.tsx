/**
 * TaskCard Component
 *
 * Displays a single task with:
 * - Checkbox for completion toggle
 * - Title and description
 * - Priority badge with color coding
 * - Due date with overdue indicator
 * - Status badge (Kanban status)
 * - Tag chips
 * - Subtask progress indicator
 * - Time tracking display
 * - Quick actions (edit, delete)
 *
 * Implements: FR-001, FR-011, FR-026, FR-039, FR-064
 */

'use client'

import React from 'react'
import { format, isPast, isToday } from 'date-fns'
import { Clock, Calendar, CheckSquare, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface TaskCardProps {
  task: Task
  onToggleComplete?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onClick?: (taskId: string) => void
  compact?: boolean
}

const PRIORITY_COLORS = {
  urgent: 'bg-purple-100 text-purple-800 border-purple-300',
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  none: 'bg-gray-100 text-gray-800 border-gray-300',
}

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  blocked: 'Blocked',
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  compact = false,
}: TaskCardProps) {
  const isOverdue =
    task.due_date && !(task.completed || task.status === 'done') && isPast(new Date(task.due_date))
  const isDueToday = task.due_date && isToday(new Date(task.due_date))

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete?.(task.id.toString())
  }

  const handleCardClick = () => {
    onClick?.(task.id.toString())
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md',
        (task.completed || task.status === 'done') && 'opacity-75',
        onClick && 'cursor-pointer',
        compact && 'p-3'
      )}
      onClick={handleCardClick}
    >
      {/* Header: Checkbox + Title + Actions */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'mt-0.5 h-5 w-5 flex-shrink-0 rounded border-2 transition-colors',
            (task.completed || task.status === 'done')
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          {(task.completed || task.status === 'done') && (
            <svg
              className="h-full w-full text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Title + Description */}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'font-medium text-gray-900',
              (task.completed || task.status === 'done') && 'line-through text-gray-500',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {task.title}
          </h3>
          {!compact && task.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            // TODO: Open dropdown menu
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Metadata Row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Priority Badge */}
        {task.priority && (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              PRIORITY_COLORS[task.priority in PRIORITY_COLORS ? task.priority : 'none']
            )}
          >
            {task.priority && typeof task.priority === 'string'
              ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
              : 'None'}
          </span>
        )}

        {/* Status Badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            STATUS_COLORS[task.status in STATUS_COLORS ? task.status : 'todo']
          )}
        >
          {STATUS_LABELS[task.status in STATUS_LABELS ? task.status : 'todo']}
        </span>

        {/* Due Date */}
        {task.due_date && (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              isOverdue && 'text-red-600 font-medium',
              isDueToday && !isOverdue && 'text-orange-600 font-medium',
              !isOverdue && !isDueToday && 'text-gray-500'
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.due_date), 'MMM d')}</span>
            {isOverdue && <span className="ml-0.5">(Overdue)</span>}
            {isDueToday && <span className="ml-0.5">(Today)</span>}
          </div>
        )}

        {/* Time Spent */}
        {task.time_spent != null && task.time_spent > 0 && (
          <div className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{Math.floor(task.time_spent / 60)}h {task.time_spent % 60}m</span>
          </div>
        )}

        {/* Subtask Progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="inline-flex items-center gap-1 text-xs text-gray-500">
            <CheckSquare className="h-3 w-3" />
            <span>
              {task.subtasks.filter(subtask => subtask.completed).length || 0}/{task.subtasks.length}
            </span>
          </div>
        )}
      </div>

      {/* Tags Row */}
      {task.tags && task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.tags.map((tagId) => {
            // Find the actual tag object from available tags
            // For now, just showing the tag ID as a placeholder
            return (
              <span
                key={tagId}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 border-gray-300"
              >
                {tagId}
              </span>
            );
          })}
        </div>
      )}
    </div>
  )
}
