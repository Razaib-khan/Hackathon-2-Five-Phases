"use client"

import { useState, useEffect } from 'react'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { CompletionTrendChart } from './CompletionTrendChart'
import { PriorityDistributionChart } from './PriorityDistributionChart'
import { TimeTrackingChart } from './TimeTrackingChart'
import { StreakCalendar } from './StreakCalendar'

interface AnalyticsDashboardProps {
  userId: string
  className?: string
}

export function AnalyticsDashboard({ userId, className = '' }: AnalyticsDashboardProps) {
  const { dashboard, streak, isLoadingDashboard, isLoadingStreak, error, fetchDashboard, fetchStreak } = useAnalytics()
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')

  // Fetch analytics data on mount and when period changes
  useEffect(() => {
    if (userId) {
      fetchDashboard(period)
      fetchStreak()
    }
  }, [userId, period, fetchDashboard, fetchStreak])

  const loading = isLoadingDashboard || isLoadingStreak;

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
            Failed to load analytics
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => {
              fetchDashboard(period)
              fetchStreak()
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No analytics data available
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Period Selector */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Analytics & Insights
        </h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend Chart */}
        <CompletionTrendChart
          data={dashboard.completion_trend}
          className="lg:col-span-2"
        />

        {/* Priority Distribution Chart */}
        <PriorityDistributionChart data={dashboard.priority_distribution} />

        {/* Time Tracking Chart */}
        <TimeTrackingChart
          categoryData={dashboard.category_breakdown}
          totalTimeSpent={dashboard.total_time_spent}
          averageCompletionTime={dashboard.average_completion_time}
        />

        {/* Streak Calendar */}
        <StreakCalendar
          completionData={dashboard.completion_trend}
          currentStreak={streak?.current_streak || 0}
          longestStreak={streak?.longest_streak || 0}
          className="lg:col-span-2"
        />
      </div>

      {/* Summary Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {dashboard.total_tasks}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {dashboard.completed_tasks}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Due Today</p>
          <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {dashboard.due_today}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {dashboard.overdue_tasks}
          </p>
        </div>
      </div>
    </div>
  )
}
