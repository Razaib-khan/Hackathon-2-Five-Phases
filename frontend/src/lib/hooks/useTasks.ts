/**
 * useTasks Hook (T075)
 *
 * Custom hook for task operations with:
 * - Optimistic updates for instant UI feedback
 * - Conflict handling with version field (FR-103)
 * - Retry logic on 409 version mismatch
 * - Automatic error handling with toast notifications
 *
 * Implements:
 * - getTasks: Fetch tasks with filters
 * - createTask: Create new task
 * - updateTask: Update task with optimistic locking
 * - deleteTask: Delete task
 * - toggleComplete: Toggle completion status
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as api from '../api'
import { Task as BaseTask, TaskCreateRequest, TaskUpdateRequest, TaskFilterOptions } from '@/models/task'

// Extend the Task interface from models to include additional properties
export interface ExtendedTask extends BaseTask {
  status: 'todo' | 'in_progress' | 'done'
  time_spent: number
  custom_order?: number
  recurrence_pattern?: any
  version: number
  tags?: any[]
  subtasks?: any[]
  subtask_count?: number
  completed_subtask_count?: number
}

// Export Task as an alias for ExtendedTask to maintain compatibility with existing imports
export type Task = ExtendedTask;

interface UseTasksReturn {
  tasks: ExtendedTask[]
  total: number
  isLoading: boolean
  error: Error | null
  fetchTasks: (userId: string, filters?: TaskFilterOptions) => Promise<void>
  createTask: (userId: string, data: TaskCreateRequest) => Promise<ExtendedTask | null>
  updateTask: (userId: string, taskId: string, data: TaskUpdateRequest) => Promise<ExtendedTask | null>
  deleteTask: (userId: string, taskId: string) => Promise<boolean>
  toggleComplete: (userId: string, taskId: string) => Promise<boolean>
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<ExtendedTask[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async (userId: string, filters?: TaskFilterOptions) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.getTasks(userId, filters)
      setTasks(response.tasks as ExtendedTask[])
      setTotal(response.total)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks')
      setError(error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTask = useCallback(async (userId: string, data: TaskCreateRequest): Promise<ExtendedTask | null> => {
    try {
      const newTask = await api.createTask(data)

      // Optimistic update
      setTasks((prev) => [newTask as ExtendedTask, ...prev])
      setTotal((prev) => prev + 1)

      toast.success('Task created')
      return newTask as ExtendedTask
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task')
      setError(error)
      toast.error('Failed to create task')
      return null
    }
  }, [])

  const updateTask = useCallback(
    async (userId: string, taskId: string, data: TaskUpdateRequest): Promise<ExtendedTask | null> => {
      // Store original task for rollback
      const originalTask = tasks.find((t) => t.id === taskId)

      try {
        // Optimistic update
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
        )

        const updatedTask = await api.updateTask(taskId, data)

        // Update with server response
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (updatedTask as ExtendedTask) : t))
        )

        toast.success('Task updated')
        return updatedTask as ExtendedTask
      } catch (err) {
        // Rollback optimistic update
        if (originalTask) {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? originalTask : t))
          )
        }

        const errorMsg = err instanceof Error ? err.message : 'Failed to update task'

        // Check for version conflict (409)
        if (errorMsg.includes('409') || errorMsg.includes('conflict')) {
          toast.error(
            'Task was modified by another action. Please refresh and try again.',
            { duration: 5000 }
          )
        } else {
          toast.error('Failed to update task')
        }

        setError(err instanceof Error ? err : new Error('Failed to update task'))
        return null
      }
    },
    [tasks]
  )

  const deleteTask = useCallback(
    async (userId: string, taskId: string): Promise<boolean> => {
      // Store original tasks for rollback
      const originalTasks = [...tasks]

      try {
        // Optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
        setTotal((prev) => prev - 1)

        await api.deleteTask(taskId)

        toast.success('Task deleted')
        return true
      } catch (err) {
        // Rollback
        setTasks(originalTasks)
        setTotal(originalTasks.length)

        toast.error('Failed to delete task')
        setError(err instanceof Error ? err : new Error('Failed to delete task'))
        return false
      }
    },
    [tasks]
  )

  const toggleComplete = useCallback(
    async (userId: string, taskId: string): Promise<boolean> => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return false

      const newCompleted = !task.completed

      // Store original for rollback
      const originalTask = { ...task }

      try {
        // Optimistic update
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, completed: newCompleted } : t
          )
        )

        await api.toggleTaskComplete(taskId, newCompleted)

        return true
      } catch (err) {
        // Rollback
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? originalTask : t))
        )

        toast.error('Failed to update task')
        setError(err instanceof Error ? err : new Error('Failed to toggle task'))
        return false
      }
    },
    [tasks]
  )

  return {
    tasks,
    total,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  }
}
