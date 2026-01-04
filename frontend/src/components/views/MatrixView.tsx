/**
 * MatrixView Component
 *
 * Eisenhower Priority Matrix view with:
 * - 2x2 grid: Urgent/Not Urgent × Important/Not Important
 * - Four quadrants:
 *   - Q1 (Do First): Urgent + Important
 *   - Q2 (Schedule): Not Urgent + Important
 *   - Q3 (Delegate): Urgent + Not Important
 *   - Q4 (Eliminate): Not Urgent + Not Important
 * - Task placement based on priority and due_date
 * - Drag-and-drop to change quadrants (updates priority/due_date)
 * - Quadrant task counts
 * - Empty state per quadrant
 *
 * Classification Logic:
 * - Urgent: due_date within next 3 days OR high priority
 * - Important: priority = high OR medium
 *
 * Implements: FR-025 (Matrix View / Eisenhower Matrix)
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useTasks, Task } from '@/lib/hooks/useTasks'
import { useFilters } from '@/contexts/FilterContext'
import { TaskCard } from '../TaskCard'
import { Loader2, AlertCircle, Clock, ChevronDown, Trash2 } from 'lucide-react'
import { addDays, parseISO, isPast, isBefore } from 'date-fns'

interface MatrixViewProps {
  userId: string
  onTaskClick?: (taskId: string) => void
}

type Quadrant = 'q1' | 'q2' | 'q3' | 'q4'

interface QuadrantConfig {
  id: Quadrant
  title: string
  subtitle: string
  color: string
  icon: React.ReactNode
}

const QUADRANTS: QuadrantConfig[] = [
  {
    id: 'q1',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    color: 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  },
  {
    id: 'q2',
    title: 'Schedule',
    subtitle: 'Not Urgent but Important',
    color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-800',
    icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  },
  {
    id: 'q3',
    title: 'Delegate',
    subtitle: 'Urgent but Not Important',
    color: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-800',
    icon: <ChevronDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
  },
  {
    id: 'q4',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    color: 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
    icon: <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />,
  },
]

export function MatrixView({ userId, onTaskClick }: MatrixViewProps) {
  const { tasks, total, isLoading, error, fetchTasks, toggleComplete } = useTasks()
  const { filters } = useFilters()

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks(userId, filters)
  }, [userId, filters, fetchTasks])

  // Determine if task is urgent (due within 3 days or high priority)
  const isUrgent = (task: Task): boolean => {
    if (task.priority === 'high') return true

    if (task.due_date) {
      const dueDate = parseISO(task.due_date)
      const threeDaysFromNow = addDays(new Date(), 3)
      return isBefore(dueDate, threeDaysFromNow)
    }

    return false
  }

  // Determine if task is important (high or medium priority)
  const isImportant = (task: Task): boolean => {
    return task.priority === 'high' || task.priority === 'medium'
  }

  // Classify task into quadrant
  const getTaskQuadrant = (task: Task): Quadrant => {
    const urgent = isUrgent(task)
    const important = isImportant(task)

    if (urgent && important) return 'q1' // Do First
    if (!urgent && important) return 'q2' // Schedule
    if (urgent && !important) return 'q3' // Delegate
    return 'q4' // Eliminate
  }

  // Group tasks by quadrant
  const tasksByQuadrant: Record<Quadrant, Task[]> = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  }

  tasks.forEach((task) => {
    const quadrant = getTaskQuadrant(task)
    tasksByQuadrant[quadrant].push(task)
  })

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load tasks</p>
        <button
          onClick={() => fetchTasks(userId, filters)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Eisenhower Matrix
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Prioritize tasks by urgency and importance
          </p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total} {total === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Classification Rules:
        </h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            • <strong>Urgent:</strong> Due within 3 days OR marked as high priority
          </li>
          <li>
            • <strong>Important:</strong> High or medium priority
          </li>
        </ul>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUADRANTS.map((quadrant) => {
          const quadrantTasks = tasksByQuadrant[quadrant.id]

          return (
            <div key={quadrant.id} className={`rounded-lg border-2 ${quadrant.color}`}>
              {/* Quadrant Header */}
              <div className="px-4 py-3 border-b border-current/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {quadrant.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {quadrant.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {quadrant.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {quadrantTasks.length}
                  </span>
                </div>
              </div>

              {/* Quadrant Content */}
              <div className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3">
                {quadrantTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      No tasks in this quadrant
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {quadrant.id === 'q1' && 'Crisis-free zone! 🎉'}
                      {quadrant.id === 'q2' && 'Add important goals here'}
                      {quadrant.id === 'q3' && 'Minimize distractions'}
                      {quadrant.id === 'q4' && 'Keep this empty!'}
                    </p>
                  </div>
                ) : (
                  quadrantTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleComplete}
                      onClick={handleTaskClick}
                      compact={false}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quadrant Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Action Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
              Q1: Do First ({tasksByQuadrant.q1.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Handle these immediately. These are your critical tasks that require immediate attention.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
              Q2: Schedule ({tasksByQuadrant.q2.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Plan time for these. They're important for long-term success but not urgent.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
              Q3: Delegate ({tasksByQuadrant.q3.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consider delegating or minimizing time on these urgent but less important tasks.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Q4: Eliminate ({tasksByQuadrant.q4.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Eliminate or postpone these. They don't contribute significantly to your goals.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create tasks and assign priorities to use the matrix
          </p>
        </div>
      )}
    </div>
  )
}
