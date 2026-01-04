/**
 * CalendarView Component
 *
 * Monthly calendar view with:
 * - Month grid (weeks x 7 days)
 * - Tasks displayed on due dates
 * - Navigation (prev/next month, today)
 * - Today indicator
 * - Task count badges per day
 * - Click day to see all tasks
 * - Empty state for days with no tasks
 * - Week numbers (optional)
 *
 * Implements: FR-024 (Calendar View)
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useTasks, Task } from '@/lib/hooks/useTasks'
import { useFilters } from '@/contexts/FilterContext'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'

interface CalendarViewProps {
  userId: string
  onTaskClick?: (taskId: string) => void
}

export function CalendarView({ userId, onTaskClick }: CalendarViewProps) {
  const { tasks, total, isLoading, error, fetchTasks, toggleComplete } = useTasks()
  const { filters } = useFilters()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks(userId, filters)
  }, [userId, filters, fetchTasks])

  // Generate calendar days
  const generateCalendarDays = (): Date[] => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days: Date[] = []
    let day = calendarStart

    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => {
      if (!task.due_date) return false
      const taskDate = parseISO(task.due_date)
      return isSameDay(taskDate, date)
    })
  }

  // Get tasks without due dates
  const getTasksWithoutDueDate = (): Task[] => {
    return tasks.filter((task) => !task.due_date)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date()) ? null : date)
  }

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    }
  }

  const calendarDays = generateCalendarDays()
  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : []
  const unscheduledTasks = getTasksWithoutDueDate()

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

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, idx) => {
              const dayTasks = getTasksForDate(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelectedDay = selectedDate && isSameDay(day, selectedDate)
              const isTodayDay = isToday(day)

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 opacity-50' : ''
                  } ${isSelectedDay ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-sm font-medium ${
                        isTodayDay
                          ? 'bg-blue-600 text-white'
                          : isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Task Count Badge */}
                    {dayTasks.length > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Preview (max 3) */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTaskClick(task.id)
                        }}
                        className={`text-xs px-2 py-1 rounded truncate ${
                          task.completed
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 line-through'
                            : task.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')} ({selectedDayTasks.length}{' '}
            {selectedDayTasks.length === 1 ? 'task' : 'tasks'})
          </h3>
          <div className="space-y-3">
            {selectedDayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleComplete(task.id, !task.completed)
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      task.completed
                        ? 'text-gray-500 dark:text-gray-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                {task.priority !== 'none' && (
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            No Due Date ({unscheduledTasks.length})
          </h3>
          <div className="space-y-2">
            {unscheduledTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="flex items-center gap-3 p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleComplete(task.id, !task.completed)
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
              </div>
            ))}
            {unscheduledTasks.length > 5 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 px-2">
                +{unscheduledTasks.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks scheduled</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create tasks with due dates to see them on the calendar
          </p>
        </div>
      )}
    </div>
  )
}
