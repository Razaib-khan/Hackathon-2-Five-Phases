/**
 * RecurrenceConfig Component
 *
 * Recurring task configuration with:
 * - Frequency selection (none, daily, weekly, monthly)
 * - Interval input (every N days/weeks/months)
 * - Weekly: weekday selection (Mon-Sun)
 * - Monthly: day of month selection
 * - End condition (never, after N occurrences, on specific date)
 * - Pattern preview/validation
 * - Stored as JSON in task.recurrence_pattern (FR-009, FR-010)
 *
 * Pattern schema:
 * {
 *   frequency: "daily" | "weekly" | "monthly",
 *   interval: number,
 *   weekdays?: number[], // 0=Sun, 1=Mon, ..., 6=Sat
 *   monthDay?: number, // 1-31
 *   endType: "never" | "after" | "on_date",
 *   endAfter?: number, // number of occurrences
 *   endDate?: string // ISO date
 * }
 *
 * Implements: FR-009, FR-010
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Repeat, Calendar, X } from 'lucide-react'

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  weekdays?: number[] // For weekly: 0=Sunday, 6=Saturday
  monthDay?: number // For monthly: 1-31
  endType: 'never' | 'after' | 'on_date'
  endAfter?: number
  endDate?: string
}

interface RecurrenceConfigProps {
  value: RecurrencePattern | null
  onChange: (pattern: RecurrencePattern | null) => void
}

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

export function RecurrenceConfig({ value, onChange }: RecurrenceConfigProps) {
  const [enabled, setEnabled] = useState(!!value)
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    value?.frequency || 'daily'
  )
  const [interval, setInterval] = useState(value?.interval || 1)
  const [weekdays, setWeekdays] = useState<number[]>(value?.weekdays || [])
  const [monthDay, setMonthDay] = useState(value?.monthDay || 1)
  const [endType, setEndType] = useState<'never' | 'after' | 'on_date'>(
    value?.endType || 'never'
  )
  const [endAfter, setEndAfter] = useState(value?.endAfter || 10)
  const [endDate, setEndDate] = useState(value?.endDate || '')

  // Update parent when config changes
  useEffect(() => {
    if (!enabled) {
      onChange(null)
      return
    }

    const pattern: RecurrencePattern = {
      frequency,
      interval,
      endType,
    }

    if (frequency === 'weekly') {
      pattern.weekdays = weekdays.length > 0 ? weekdays : [new Date().getDay()] // Default to today
    }

    if (frequency === 'monthly') {
      pattern.monthDay = monthDay
    }

    if (endType === 'after') {
      pattern.endAfter = endAfter
    }

    if (endType === 'on_date') {
      pattern.endDate = endDate
    }

    onChange(pattern)
  }, [enabled, frequency, interval, weekdays, monthDay, endType, endAfter, endDate, onChange])

  const toggleWeekday = (day: number) => {
    if (weekdays.includes(day)) {
      setWeekdays(weekdays.filter((d) => d !== day))
    } else {
      setWeekdays([...weekdays, day].sort((a, b) => a - b))
    }
  }

  const getPatternDescription = (): string => {
    if (!enabled) return 'Does not repeat'

    let desc = `Every `

    if (interval > 1) {
      desc += `${interval} `
    }

    switch (frequency) {
      case 'daily':
        desc += interval > 1 ? 'days' : 'day'
        break
      case 'weekly':
        desc += interval > 1 ? 'weeks' : 'week'
        if (weekdays.length > 0) {
          const dayNames = weekdays.map((d) => WEEKDAYS.find((wd) => wd.value === d)?.label)
          desc += ` on ${dayNames.join(', ')}`
        }
        break
      case 'monthly':
        desc += interval > 1 ? 'months' : 'month'
        desc += ` on day ${monthDay}`
        break
    }

    if (endType === 'after') {
      desc += `, ${endAfter} times`
    } else if (endType === 'on_date' && endDate) {
      desc += `, until ${new Date(endDate).toLocaleDateString()}`
    }

    return desc
  }

  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Repeat className="h-4 w-4" />
          Repeat
        </label>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Pattern Preview */}
      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
        {getPatternDescription()}
      </div>

      {/* Configuration (when enabled) */}
      {enabled && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq as any)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                    frequency === freq
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {frequency === 'daily' && (interval > 1 ? 'days' : 'day')}
                {frequency === 'weekly' && (interval > 1 ? 'weeks' : 'week')}
                {frequency === 'monthly' && (interval > 1 ? 'months' : 'month')}
              </span>
            </div>
          </div>

          {/* Weekly: Weekday Selection */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On days
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleWeekday(day.value)}
                    className={`w-10 h-10 rounded-full text-sm font-medium border transition-all ${
                      weekdays.includes(day.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Day Selection */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                On day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={monthDay}
                onChange={(e) => setMonthDay(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* End Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ends
            </label>
            <div className="space-y-3">
              {/* Never */}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'never'}
                  onChange={() => setEndType('never')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Never</span>
              </label>

              {/* After N occurrences */}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'after'}
                  onChange={() => setEndType('after')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">After</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={endAfter}
                  onChange={(e) => setEndAfter(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={endType !== 'after'}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">occurrences</span>
              </label>

              {/* On specific date */}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={endType === 'on_date'}
                  onChange={() => setEndType('on_date')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">On</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={endType !== 'on_date'}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
