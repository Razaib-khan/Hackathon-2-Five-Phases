/**
 * TimeTracker Component
 *
 * Manual time tracking for tasks with:
 * - Display current time_spent (formatted as hours/minutes)
 * - Start/stop timer for live tracking
 * - Manual time entry (add duration)
 * - Time log visualization (optional history)
 * - Automatic task update on timer stop
 *
 * Implements: FR-008 (Time Tracking)
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Clock, Play, Pause, Plus, X } from 'lucide-react'
import { useTasks } from '@/lib/hooks/useTasks'

interface TimeTrackerProps {
  taskId: string
  userId: string
  currentTimeSpent: number // in minutes
  onUpdate: () => void
}

export function TimeTracker({ taskId, userId, currentTimeSpent, onUpdate }: TimeTrackerProps) {
  const { updateTask } = useTasks()

  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualHours, setManualHours] = useState(0)
  const [manualMinutes, setManualMinutes] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format time in minutes to readable string
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Format elapsed seconds to HH:MM:SS
  const formatElapsed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStart = () => {
    setElapsedSeconds(0)
    setIsRunning(true)
  }

  const handleStop = async () => {
    setIsRunning(false)

    // Calculate minutes from elapsed seconds (round up)
    const minutesToAdd = Math.ceil(elapsedSeconds / 60)

    if (minutesToAdd > 0) {
      const newTimeSpent = currentTimeSpent + minutesToAdd
      await updateTask(userId, taskId, { time_spent: newTimeSpent })
      onUpdate()
    }

    setElapsedSeconds(0)
  }

  const handleManualAdd = async () => {
    const totalMinutes = manualHours * 60 + manualMinutes

    if (totalMinutes > 0) {
      const newTimeSpent = currentTimeSpent + totalMinutes
      await updateTask(userId, taskId, { time_spent: newTimeSpent })
      onUpdate()

      // Reset manual entry
      setManualHours(0)
      setManualMinutes(0)
      setShowManualEntry(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Reset time spent to 0? This action cannot be undone.')) {
      await updateTask(userId, taskId, { time_spent: 0 })
      onUpdate()
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
      {/* Current Time Spent */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Time Spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatDuration(currentTimeSpent)}
          </p>
        </div>
        {currentTimeSpent > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Timer Section */}
      <div className="space-y-3">
        {/* Timer Display */}
        {isRunning && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatElapsed(elapsedSeconds)}
              </p>
            </div>
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Play className="h-4 w-4" />
              Start Timer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              <Pause className="h-4 w-4" />
              Stop Timer
            </button>
          )}

          {!isRunning && (
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
              Add Time
            </button>
          )}
        </div>

        {/* Manual Time Entry */}
        {showManualEntry && !isRunning && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Add Time Manually</h4>
              <button
                onClick={() => setShowManualEntry(false)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={manualHours}
                  onChange={(e) => setManualHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleManualAdd}
              disabled={manualHours === 0 && manualMinutes === 0}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {manualHours > 0 && `${manualHours}h `}
              {manualMinutes > 0 && `${manualMinutes}m`}
            </button>
          </div>
        )}
      </div>

      {/* Time Tracking Tips */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Use the timer for live tracking or add time manually for completed work.
        </p>
      </div>
    </div>
  )
}
