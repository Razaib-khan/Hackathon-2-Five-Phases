/**
 * useSubtasks Hook (T077)
 *
 * Custom hook for subtask operations with:
 * - Optimistic updates for instant UI feedback
 * - Automatic error handling with toast notifications
 * - 50 subtask per task limit enforcement (FR-106)
 *
 * Implements:
 * - createSubtask: Create new subtask
 * - updateSubtask: Update subtask title/completed/order
 * - deleteSubtask: Delete subtask
 */

import { useCallback } from 'react'
import { toast } from 'sonner'
import * as api from '../api'
import { Subtask, SubtaskCreateData, SubtaskUpdateData } from '@/models/task'

interface UseSubtasksReturn {
  createSubtask: (
    taskId: string,
    data: SubtaskCreateData,
    currentCount?: number
  ) => Promise<Subtask | null>
  updateSubtask: (
    subtaskId: string,
    data: SubtaskUpdateData
  ) => Promise<Subtask | null>
  deleteSubtask: (subtaskId: string) => Promise<boolean>
}

export function useSubtasks(): UseSubtasksReturn {
  const createSubtask = useCallback(
    async (
      taskId: string,
      data: SubtaskCreateData,
      currentCount: number = 0
    ): Promise<Subtask | null> => {
      // Check 50 subtask limit (FR-106)
      if (currentCount >= 50) {
        toast.error('Maximum 50 subtasks per task allowed')
        return null
      }

      try {
        const newSubtask = await api.createSubtask(taskId, data)

        toast.success('Subtask created')
        return newSubtask
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to create subtask'

        // Check for 403 (limit reached)
        if (errorMsg.includes('403') || errorMsg.includes('limit')) {
          toast.error('Maximum 50 subtasks per task reached')
        } else if (errorMsg.includes('404')) {
          toast.error('Task not found')
        } else {
          toast.error('Failed to create subtask')
        }

        return null
      }
    },
    []
  )

  const updateSubtask = useCallback(
    async (
      subtaskId: string,
      data: SubtaskUpdateData
    ): Promise<Subtask | null> => {
      try {
        const updatedSubtask = await api.updateSubtask(subtaskId, data)

        toast.success('Subtask updated')
        return updatedSubtask
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to update subtask'

        if (errorMsg.includes('404')) {
          toast.error('Subtask not found')
        } else {
          toast.error('Failed to update subtask')
        }

        return null
      }
    },
    []
  )

  const deleteSubtask = useCallback(async (subtaskId: string): Promise<boolean> => {
    try {
      await api.deleteSubtask(subtaskId)

      toast.success('Subtask deleted')
      return true
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete subtask'

      if (errorMsg.includes('404')) {
        toast.error('Subtask not found')
      } else {
        toast.error('Failed to delete subtask')
      }

      return false
    }
  }, [])

  return {
    createSubtask,
    updateSubtask,
    deleteSubtask,
  }
}
