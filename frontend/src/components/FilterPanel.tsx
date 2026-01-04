/**
 * FilterPanel Component
 *
 * Multi-criteria filtering UI with:
 * - Priority multi-select (high, medium, low, none)
 * - Status multi-select (todo, in_progress, done)
 * - Tag multi-select (from user's tags)
 * - Due date range picker (start/end)
 * - Search input (200 char limit - FR-051)
 * - Clear all filters button
 * - Active filter count badge
 * - AND logic for combined filters (FR-052)
 *
 * Implements: FR-047, FR-048, FR-049, FR-050, FR-051, FR-052
 */

'use client'

import React, { useState } from 'react'
import { Filter, X, Calendar, Search, Tag as TagIcon } from 'lucide-react'
import { useFilters } from '@/contexts/FilterContext'
import { useTags } from '@/lib/hooks/useTags'

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-800 border-gray-300' },
]

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800 border-green-300' },
]

interface FilterPanelProps {
  isOpen: boolean
  onClose?: () => void
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const {
    filters,
    setPriority,
    setStatus,
    setTagIds,
    setDueDateStart,
    setDueDateEnd,
    setSearch,
    clearFilters,
  } = useFilters()

  const { tags: availableTags } = useTags()

  const [localSearch, setLocalSearch] = useState(filters.search)

  // Calculate active filter count
  const activeFilterCount =
    filters.priority.length +
    filters.status.length +
    filters.tag_ids.length +
    (filters.due_date_start ? 1 : 0) +
    (filters.due_date_end ? 1 : 0) +
    (filters.search.length > 0 ? 1 : 0)

  const togglePriority = (priority: string) => {
    if (filters.priority.includes(priority)) {
      setPriority(filters.priority.filter((p) => p !== priority))
    } else {
      setPriority([...filters.priority, priority])
    }
  }

  const toggleStatus = (status: string) => {
    if (filters.status.includes(status)) {
      setStatus(filters.status.filter((s) => s !== status))
    } else {
      setStatus([...filters.status, status])
    }
  }

  const toggleTag = (tagId: string) => {
    if (filters.tag_ids.includes(tagId)) {
      setTagIds(filters.tag_ids.filter((id) => id !== tagId))
    } else {
      setTagIds([...filters.tag_ids, tagId])
    }
  }

  const handleSearchChange = (value: string) => {
    const trimmed = value.slice(0, 200) // Enforce 200 char limit (FR-051)
    setLocalSearch(trimmed)
    setSearch(trimmed)
  }

  const handleClearAll = () => {
    clearFilters()
    setLocalSearch('')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Search className="h-4 w-4 inline mr-1" />
          Search
        </label>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search tasks..."
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {localSearch.length}/200 characters
        </p>
      </div>

      {/* Priority Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Priority
        </label>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = filters.priority.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                  isSelected
                    ? option.color
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = filters.status.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                  isSelected
                    ? option.color
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tag Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <TagIcon className="h-4 w-4 inline mr-1" />
          Tags
        </label>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = filters.tag_ids.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium border transition-all"
                  style={{
                    backgroundColor: isSelected ? tag.color : 'transparent',
                    color: isSelected ? '#fff' : tag.color,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No tags available. Create tags in the sidebar.
          </p>
        )}
      </div>

      {/* Due Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          Due Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={filters.due_date_start ? filters.due_date_start.toISOString().split('T')[0] : ''}
              onChange={(e) => setDueDateStart(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={filters.due_date_end ? filters.due_date_end.toISOString().split('T')[0] : ''}
              onChange={(e) => setDueDateEnd(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Description */}
      {activeFilterCount > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Showing tasks that match <span className="font-medium">ALL</span> selected filters (AND logic)
          </p>
        </div>
      )}
    </div>
  )
}
