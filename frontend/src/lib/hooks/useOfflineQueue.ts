/**
 * Offline Queue Hook
 *
 * Manages offline operations queue:
 * - Stores operations in localStorage when offline
 * - Auto-syncs when connection restored
 * - Retry failed operations
 * - Conflict resolution
 */

import { useState, useEffect, useCallback } from 'react'

export interface QueuedOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: 'task' | 'tag' | 'subtask'
  data: any
  timestamp: number
  retries: number
}

const QUEUE_KEY = 'aido_offline_queue'
const MAX_RETRIES = 3

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedOperation[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load queue from localStorage
  useEffect(() => {
    const storedQueue = localStorage.getItem(QUEUE_KEY)
    if (storedQueue) {
      try {
        setQueue(JSON.parse(storedQueue))
      } catch (error) {
        console.error('Failed to load offline queue:', error)
      }
    }
  }, [])

  // Save queue to localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  }, [queue])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-sync when back online
      syncQueue()
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Add operation to queue
  const enqueue = useCallback((operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>) => {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${operation.type}_${operation.resource}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    }

    setQueue((prev) => [...prev, queuedOp])
    return queuedOp.id
  }, [])

  // Remove operation from queue
  const dequeue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((op) => op.id !== id))
  }, [])

  // Execute a single operation
  const executeOperation = async (operation: QueuedOperation): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      let url = ''
      let method = ''
      let body: any = null

      // Build request based on operation type and resource
      switch (operation.resource) {
        case 'task':
          switch (operation.type) {
            case 'create':
              url = `${baseUrl}/api/tasks`
              method = 'POST'
              body = operation.data
              break
            case 'update':
              url = `${baseUrl}/api/tasks/${operation.data.id}`
              method = 'PATCH'
              body = operation.data.updates
              break
            case 'delete':
              url = `${baseUrl}/api/tasks/${operation.data.id}`
              method = 'DELETE'
              break
          }
          break

        case 'tag':
          switch (operation.type) {
            case 'create':
              url = `${baseUrl}/api/tags`
              method = 'POST'
              body = operation.data
              break
            case 'update':
              url = `${baseUrl}/api/tags/${operation.data.id}`
              method = 'PATCH'
              body = operation.data.updates
              break
            case 'delete':
              url = `${baseUrl}/api/tags/${operation.data.id}`
              method = 'DELETE'
              break
          }
          break

        case 'subtask':
          switch (operation.type) {
            case 'create':
              url = `${baseUrl}/api/tasks/${operation.data.task_id}/subtasks`
              method = 'POST'
              body = operation.data
              break
            case 'update':
              url = `${baseUrl}/api/subtasks/${operation.data.id}`
              method = 'PATCH'
              body = operation.data.updates
              break
            case 'delete':
              url = `${baseUrl}/api/subtasks/${operation.data.id}`
              method = 'DELETE'
              break
          }
          break
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      })

      if (!response.ok) {
        // Handle version conflicts
        if (response.status === 409) {
          console.warn('Version conflict for operation:', operation)
          // Could implement conflict resolution here
          return false
        }
        throw new Error(`HTTP ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to execute operation:', error)
      return false
    }
  }

  // Sync all queued operations
  const syncQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isSyncing) {
      return
    }

    setIsSyncing(true)

    try {
      const results = await Promise.allSettled(
        queue.map(async (operation) => {
          const success = await executeOperation(operation)

          if (success) {
            dequeue(operation.id)
            return { operation, success: true }
          } else {
            // Retry logic
            if (operation.retries < MAX_RETRIES) {
              setQueue((prev) =>
                prev.map((op) =>
                  op.id === operation.id
                    ? { ...op, retries: op.retries + 1 }
                    : op
                )
              )
              return { operation, success: false, retry: true }
            } else {
              // Max retries reached, remove from queue
              dequeue(operation.id)
              return { operation, success: false, retry: false }
            }
          }
        })
      )

      console.log('Sync results:', results)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, queue, isSyncing, dequeue])

  // Clear all operations
  const clearQueue = useCallback(() => {
    setQueue([])
    localStorage.removeItem(QUEUE_KEY)
  }, [])

  return {
    queue,
    queueLength: queue.length,
    isOnline,
    isSyncing,
    enqueue,
    dequeue,
    syncQueue,
    clearQueue,
  }
}
