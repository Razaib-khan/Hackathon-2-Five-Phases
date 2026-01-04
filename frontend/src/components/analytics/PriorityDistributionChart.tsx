"use client"

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface PriorityDistribution {
  high: number
  medium: number
  low: number
  none: number
}

interface PriorityDistributionChartProps {
  data: PriorityDistribution
  className?: string
}

// Color mapping for priority levels
const PRIORITY_COLORS = {
  high: '#ef4444', // red-500
  medium: '#f59e0b', // amber-500
  low: '#3b82f6', // blue-500
  none: '#6b7280', // gray-500
}

const PRIORITY_LABELS = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
  none: 'No Priority',
}

export function PriorityDistributionChart({ data, className = '' }: PriorityDistributionChartProps) {
  // Convert data to Recharts format
  const chartData = useMemo(() => {
    return Object.entries(data)
      .map(([priority, count]) => ({
        name: PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS],
        value: count,
        priority: priority,
      }))
      .filter((item) => item.value > 0) // Only show priorities with tasks
  }, [data])

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  // Custom label renderer
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0)
    return `${percent}%`
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percent = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {data.name}
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>Tasks: <span className="font-semibold">{data.value}</span></p>
            <p>Percentage: <span className="font-semibold">{percent}%</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Priority Distribution
      </h3>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No tasks to display
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {chartData.map((entry) => (
              <div key={entry.priority} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {entry.name}: <span className="font-semibold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Tasks: <span className="font-semibold text-gray-900 dark:text-gray-100">{total}</span>
            </span>
          </div>
        </>
      )}
    </div>
  )
}
