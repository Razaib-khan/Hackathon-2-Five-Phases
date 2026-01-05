/**
 * ListView Component
 *
 * Traditional vertical list view for tasks with:
 * - Task cards in chronological order
 * - Sorting options (created_at, due_date, priority, custom_order)
 * - Grouping options (none, priority, status, due_date)
 * - Infinite scroll or pagination
 * - Bulk selection mode (optional)
 * - Empty state
 *
 * Implements: FR-022 (List View)
 */

'use client'

import React, { useState, useEffect } from 'react'
import { TaskCard } from '../TaskCard'
import { useTasks, Task } from '@/lib/hooks/useTasks'
import { useFilters } from '@/contexts/FilterContext'
import { Loader2 } from 'lucide-react'

type SortBy = 'created_at' | 'due_date' | 'priority' | 'custom_order' | 'title'
type SortOrder = 'asc' | 'desc'
type GroupBy = 'none' | 'priority' | 'status' | 'due_date'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2, none: 3 }
const STATUS_ORDER = { todo: 0, in_progress: 1, done: 2 }

interface ListViewProps {
  userId: string
  onTaskClick?: (taskId: string) => void
}

export function ListView({ userId, onTaskClick }: ListViewProps) {
  const { tasks, total, isLoading, error, fetchTasks, toggleComplete } = useTasks()
  const { filters } = useFilters()

  const [sortBy, setSortBy] = useState<SortBy>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks(userId, filters)
  }, [userId, filters, fetchTasks])

  // Sort tasks
  const sortTasks = (tasksToSort: Task[]): Task[] => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'due_date':
          if (!a.due_date && !b.due_date) comparison = 0
          else if (!a.due_date) comparison = 1
          else if (!b.due_date) comparison = -1
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          break
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          break
        case 'custom_order':
          if (a.custom_order == null && b.custom_order == null) comparison = 0
          else if (a.custom_order == null) comparison = 1
          else if (b.custom_order == null) comparison = -1
          else comparison = a.custom_order - b.custom_order
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  // Group tasks
  const groupTasks = (tasksToGroup: Task[]): Record<string, Task[]> => {
    if (groupBy === 'none') {
      return { all: tasksToGroup }
    }

    const groups: Record<string, Task[]> = {}

    tasksToGroup.forEach((task) => {
      let key: string

      switch (groupBy) {
        case 'priority':
          key = task.priority
          break
        case 'status':
          key = task.status
          break
        case 'due_date':
          if (!task.due_date) {
            key = 'No due date'
          } else {
            const dueDate = new Date(task.due_date)
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            if (dueDate < today) key = 'Overdue'
            else if (dueDate.toDateString() === today.toDateString()) key = 'Today'
            else if (dueDate.toDateString() === tomorrow.toDateString()) key = 'Tomorrow'
            else key = 'Upcoming'
          }
          break
        default:
          key = 'all'
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
    })

    return groups
  }

  const sortedTasks = sortTasks(tasks)
  const groupedTasks = groupTasks(sortedTasks)

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    }
  }

  const handleToggleCompleteForTaskCard = (taskId: string) => {
    toggleComplete(userId, taskId)
  }

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    toggleComplete(userId, taskId)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 mb-4">Failed to load tasks</p>
        <button
          onClick={() => fetchTasks(userId, filters)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="custom_order">Custom Order</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Group */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Group by:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
        </div>

        {/* Task count */}
        <p className="text-sm text-gray-500">
          {total} {total === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Task List */}
      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No tasks found</p>
          <p className="text-sm text-gray-400">
            Create a new task or adjust your filters
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName}>
              {/* Group Header */}
              {groupBy !== 'none' && (
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {groupName} ({groupTasks.length})
                </h3>
              )}

              {/* Tasks */}
              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleCompleteForTaskCard}
                    onClick={handleTaskClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
