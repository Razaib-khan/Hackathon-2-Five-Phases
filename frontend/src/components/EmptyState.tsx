/**
 * Empty State Components
 *
 * Displays friendly empty states for:
 * - No tasks
 * - No results
 * - No tags
 * - No data
 */

'use client'

import { motion } from 'motion/react'
import { fadeVariants } from '@/lib/animations'
import { ReactNode } from 'react'
import {
  CheckSquare,
  Search,
  Tag,
  Calendar,
  Inbox,
  Filter,
  Plus,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>

      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

// Predefined empty states

export function NoTasksEmptyState({ onCreateTask }: { onCreateTask?: () => void }) {
  return (
    <EmptyState
      icon={<CheckSquare className="w-8 h-8 text-gray-400" />}
      title="No tasks yet"
      description="Get started by creating your first task. You can add a title, set a due date, assign tags, and more."
      action={
        onCreateTask
          ? {
              label: 'Create Task',
              onClick: onCreateTask,
            }
          : undefined
      }
    />
  )
}

export function NoSearchResultsEmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-400" />}
      title="No results found"
      description={`We couldn't find any tasks matching "${searchQuery}". Try adjusting your search or filters.`}
    />
  )
}

export function NoFilteredTasksEmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon={<Filter className="w-8 h-8 text-gray-400" />}
      title="No tasks match your filters"
      description="Try adjusting your filters to see more tasks, or clear all filters to see everything."
      action={
        onClearFilters
          ? {
              label: 'Clear Filters',
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  )
}

export function NoTagsEmptyState({ onCreateTag }: { onCreateTag?: () => void }) {
  return (
    <EmptyState
      icon={<Tag className="w-8 h-8 text-gray-400" />}
      title="No tags yet"
      description="Tags help you organize your tasks. Create your first tag to get started."
      action={
        onCreateTag
          ? {
              label: 'Create Tag',
              onClick: onCreateTag,
            }
          : undefined
      }
    />
  )
}

export function NoTasksDueTodayEmptyState() {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8 text-gray-400" />}
      title="Nothing due today"
      description="You're all caught up! No tasks are due today."
    />
  )
}

export function NoOverdueTasksEmptyState() {
  return (
    <EmptyState
      icon={<CheckSquare className="w-8 h-8 text-green-500" />}
      title="All caught up!"
      description="Great job! You don't have any overdue tasks."
    />
  )
}

export function NoCompletedTasksEmptyState() {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-gray-400" />}
      title="No completed tasks yet"
      description="Complete some tasks to see them here. Check the box next to a task to mark it as complete."
    />
  )
}

// Compact empty state (inline version)
export function CompactEmptyState({ message, className = '' }: { message: string; className?: string }) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`text-center py-8 ${className}`}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </motion.div>
  )
}
