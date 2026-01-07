"use client"

import { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'

interface CompletionTrendDataPoint {
  date: string
  completed: number
  created: number
}

interface StreakCalendarProps {
  completionData: CompletionTrendDataPoint[]
  currentStreak: number
  longestStreak: number
  className?: string
}

export function StreakCalendar({
  completionData,
  currentStreak,
  longestStreak,
  className = '',
}: StreakCalendarProps) {
  // Generate last 12 weeks of dates
  const calendarData = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, 83) // 12 weeks = 84 days
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 })

    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    for (let i = 0; i < 84; i++) {
      const date = addDays(weekStart, i)
      currentWeek.push(date)

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    return weeks
  }, [])

  // Create a map of date -> completion count for quick lookup
  const completionMap = useMemo(() => {
    const map = new Map<string, number>()
    completionData.forEach((point) => {
      map.set(point.date, point.completed)
    })
    return map
  }, [completionData])

  // Get completion count for a date
  const getCompletionCount = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return completionMap.get(dateStr) || 0
  }

  // Get color intensity based on completion count
  const getIntensityColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-green-200 dark:bg-green-900/40'
    if (count <= 3) return 'bg-green-400 dark:bg-green-700/60'
    if (count <= 5) return 'bg-green-600 dark:bg-green-600/80'
    return 'bg-green-700 dark:bg-green-500'
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date())
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Completion Streak Calendar
        </h3>
      </div>

      {/* Streak Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Current Streak</p>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            {currentStreak} <span className="text-lg">days</span>
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Longest Streak</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {longestStreak} <span className="text-lg">days</span>
          </p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div
                key={i}
                className="w-4 h-4 mx-0.5 text-[10px] text-center text-gray-600 dark:text-gray-400"
              >
                {day[0]}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {calendarData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((date, dayIndex) => {
                  const count = getCompletionCount(date)
                  const intensityColor = getIntensityColor(count)
                  const today = isToday(date)

                  return (
                    <div
                      key={dayIndex}
                      className={`
                        w-4 h-4 rounded-sm cursor-pointer transition-all
                        ${intensityColor}
                        ${today ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                        hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500
                      `}
                      title={`${format(date, 'MMM d, yyyy')}: ${count} task${count !== 1 ? 's' : ''} completed`}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Month labels */}
          <div className="flex mt-2 text-[10px] text-gray-600 dark:text-gray-400">
            <div className="w-8"></div>
            <div className="flex-1">
              {format(calendarData[0][0], 'MMM')} → {format(calendarData[calendarData.length - 1][6], 'MMM yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-gray-600 dark:text-gray-400">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-100 dark:bg-gray-800" title="0 completions" />
          <div className="w-4 h-4 rounded-sm bg-green-200 dark:bg-green-900/40" title="1 completion" />
          <div className="w-4 h-4 rounded-sm bg-green-400 dark:bg-green-700/60" title="2-3 completions" />
          <div className="w-4 h-4 rounded-sm bg-green-600 dark:bg-green-600/80" title="4-5 completions" />
          <div className="w-4 h-4 rounded-sm bg-green-700 dark:bg-green-500" title="6+ completions" />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">More</span>
      </div>
    </div>
  )
}
