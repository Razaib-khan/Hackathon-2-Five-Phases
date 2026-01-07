/**
 * ConflictResolutionDialog Component
 *
 * Handles optimistic locking version conflicts (HTTP 409) with:
 * - Side-by-side comparison of local vs server state
 * - Highlight changed fields
 * - Resolution options:
 *   - Keep local changes (force overwrite)
 *   - Accept server changes (discard local)
 *   - Manual merge (choose field by field)
 * - Automatic retry with conflict resolution
 *
 * Implements: FR-103 (Version Conflict Handling)
 */

'use client'

import React, { useState } from 'react'
import { AlertTriangle, ChevronRight, X } from 'lucide-react'
import { Task } from '@/lib/hooks/useTasks'

interface ConflictResolutionDialogProps {
  localTask: Task
  serverTask: Task
  onResolve: (resolution: 'local' | 'server' | 'merge', mergedData?: Partial<Task>) => void
  onCancel: () => void
}

type ConflictField = keyof Task

const CONFLICTABLE_FIELDS: ConflictField[] = [
  'title',
  'description',
  'priority',
  'status',
  'due_date',
  'completed',
  'time_spent',
  'custom_order',
]

export function ConflictResolutionDialog({
  localTask,
  serverTask,
  onResolve,
  onCancel,
}: ConflictResolutionDialogProps) {
  const [resolutionMode, setResolutionMode] = useState<'auto' | 'manual'>('auto')
  const [selectedFields, setSelectedFields] = useState<Record<ConflictField, 'local' | 'server'>>(
    {} as any
  )

  // Detect which fields differ
  const conflictingFields = CONFLICTABLE_FIELDS.filter((field) => {
    const localVal = localTask[field]
    const serverVal = serverTask[field]

    // Handle different types
    if (localVal === serverVal) return false
    if (localVal == null && serverVal == null) return false

    // Date comparison
    if (field === 'due_date') {
      const localDate = localVal ? new Date(localVal as string).getTime() : null
      const serverDate = serverVal ? new Date(serverVal as string).getTime() : null
      return localDate !== serverDate
    }

    return true
  })

  const formatFieldValue = (field: ConflictField, value: any): string => {
    if (value == null) return 'Not set'

    switch (field) {
      case 'due_date':
        return new Date(value).toLocaleString()
      case 'completed':
        return value ? 'Yes' : 'No'
      case 'priority':
        return value.charAt(0).toUpperCase() + value.slice(1)
      case 'status':
        return value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      case 'time_spent':
        if (value < 60) return `${value}m`
        const hours = Math.floor(value / 60)
        const mins = value % 60
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      default:
        return String(value)
    }
  }

  const getFieldLabel = (field: ConflictField): string => {
    return field
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const handleAutoResolve = (choice: 'local' | 'server') => {
    onResolve(choice)
  }

  const handleManualMerge = () => {
    // Build merged data from selected fields
    const mergedData: Partial<Task> = {}

    conflictingFields.forEach((field) => {
      const choice = selectedFields[field]
      if (choice === 'local') {
        mergedData[field] = localTask[field] as any
      } else if (choice === 'server') {
        mergedData[field] = serverTask[field] as any
      }
    })

    onResolve('merge', mergedData)
  }

  const toggleFieldSelection = (field: ConflictField) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: prev[field] === 'local' ? 'server' : 'local',
    }))
  }

  // Initialize selections to local by default
  if (resolutionMode === 'manual' && Object.keys(selectedFields).length === 0) {
    const initial: any = {}
    conflictingFields.forEach((field) => {
      initial[field] = 'local'
    })
    setSelectedFields(initial)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Version Conflict Detected
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This task was modified by another action while you were editing. Please choose how to resolve the
                conflict.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Resolution Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <button
              onClick={() => setResolutionMode('auto')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                resolutionMode === 'auto'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Quick Resolution
            </button>
            <button
              onClick={() => setResolutionMode('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                resolutionMode === 'manual'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Manual Merge
            </button>
          </div>

          {/* Auto Resolution */}
          {resolutionMode === 'auto' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose which version to keep:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAutoResolve('local')}
                  className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Keep My Changes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overwrite the server version with your local edits ({conflictingFields.length}{' '}
                    {conflictingFields.length === 1 ? 'field' : 'fields'} changed)
                  </p>
                </button>

                <button
                  onClick={() => handleAutoResolve('server')}
                  className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Accept Server Version
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discard your local changes and use the current server state
                  </p>
                </button>
              </div>

              {/* Conflict Summary */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Changed Fields ({conflictingFields.length}):
                </h4>
                <div className="space-y-2">
                  {conflictingFields.map((field) => (
                    <div key={field} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{getFieldLabel(field)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {formatFieldValue(field, localTask[field])}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatFieldValue(field, serverTask[field])}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Manual Merge */}
          {resolutionMode === 'manual' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which value to keep for each conflicting field:
              </p>

              <div className="space-y-3">
                {conflictingFields.map((field) => (
                  <div
                    key={field}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        {getFieldLabel(field)}
                      </h5>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                      <button
                        onClick={() => toggleFieldSelection(field)}
                        className={`p-3 text-left transition-colors ${
                          selectedFields[field] === 'local'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Version</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatFieldValue(field, localTask[field])}
                        </p>
                      </button>

                      <button
                        onClick={() => toggleFieldSelection(field)}
                        className={`p-3 text-left transition-colors ${
                          selectedFields[field] === 'server'
                            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Server Version</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatFieldValue(field, serverTask[field])}
                        </p>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualMerge}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Apply Merge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
