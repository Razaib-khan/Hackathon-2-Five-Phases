"use client"

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CategoryBreakdown {
  tag_name: string
  tag_color: string
  task_count: number
  completed_count: number
}

interface TimeTrackingChartProps {
  categoryData: CategoryBreakdown[]
  totalTimeSpent: number
  averageCompletionTime: number
  className?: string
}

export function TimeTrackingChart({
  categoryData,
  totalTimeSpent,
  averageCompletionTime,
  className = '',
}: TimeTrackingChartProps) {
  // Format time for display (e.g., "2h 30m")
  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  // Estimate time per category based on task count
  const chartData = useMemo(() => {
    const totalTasks = categoryData.reduce((sum, cat) => sum + cat.completed_count, 0)

    return categoryData
      .map((category) => {
        // Estimate time spent on this category proportional to completed tasks
        const estimatedTime = totalTasks > 0
          ? Math.round((category.completed_count / totalTasks) * totalTimeSpent)
          : 0

        return {
          name: category.tag_name,
          time: estimatedTime,
          color: category.tag_color,
          completed: category.completed_count,
          total: category.task_count,
        }
      })
      .filter((item) => item.time > 0) // Only show categories with time
      .sort((a, b) => b.time - a.time) // Sort by time descending
      .slice(0, 8) // Show top 8 categories
  }, [categoryData, totalTimeSpent])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {data.name}
          </p>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p>Time Spent: <span className="font-semibold">{formatTime(data.time)}</span></p>
            <p>Completed: <span className="font-semibold">{data.completed}</span> / {data.total} tasks</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Time Tracking by Category
      </h3>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Time Tracked</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatTime(totalTimeSpent)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Avg. Completion Time</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatTime(averageCompletionTime)}
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No time tracking data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-sm text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => formatTime(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="time" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        Time estimates based on completed tasks per category
      </p>
    </div>
  )
}
