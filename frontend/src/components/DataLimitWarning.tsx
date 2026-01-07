/**
 * Data Limit Warning Components
 *
 * Displays warnings when approaching or exceeding data limits:
 * - Task limits (10,000 per user)
 * - Tag limits (100 per user)
 * - Subtask limits (50 per task)
 * - Tags per task limits (10 per task)
 */

'use client'

import { motion } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'
import { fadeVariants } from '@/lib/animations'

interface DataLimitWarningProps {
  current: number
  max: number
  entity: 'tasks' | 'tags' | 'subtasks' | 'task tags'
  onDismiss?: () => void
  showProgress?: boolean
}

export function DataLimitWarning({
  current,
  max,
  entity,
  onDismiss,
  showProgress = true,
}: DataLimitWarningProps) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80 && percentage < 100
  const isAtLimit = percentage >= 100

  // Don't show if not near limit
  if (percentage < 80) return null

  const severity = isAtLimit ? 'error' : 'warning'

  const colors = {
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      progress: 'bg-red-600',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
      progress: 'bg-yellow-600',
    },
  }

  const color = colors[severity]

  const getMessage = () => {
    if (isAtLimit) {
      return `You've reached the maximum of ${max.toLocaleString()} ${entity}. Please delete some to add more.`
    }
    return `You're using ${current.toLocaleString()} of ${max.toLocaleString()} ${entity}. Consider cleaning up to avoid hitting the limit.`
  }

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`${color.bg} ${color.border} border rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className={`w-5 h-5 ${color.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={`text-sm font-medium ${color.text}`}>
              {isAtLimit ? 'Limit Reached' : 'Approaching Limit'}
            </p>
            {onDismiss && (
              <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex-shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${color.text}`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <p className={`text-sm ${color.text} opacity-90`}>
            {getMessage()}
          </p>

          {showProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={color.text}>
                  {current.toLocaleString()} / {max.toLocaleString()}
                </span>
                <span className={color.text}>{percentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${color.progress} rounded-full`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Inline compact version
export function InlineDataLimitWarning({ current, max, entity }: Omit<DataLimitWarningProps, 'onDismiss' | 'showProgress'>) {
  const percentage = (current / max) * 100

  if (percentage < 80) return null

  const isAtLimit = percentage >= 100

  return (
    <div className="flex items-center gap-2 text-xs">
      <AlertTriangle className={`w-3 h-3 ${isAtLimit ? 'text-red-500' : 'text-yellow-500'}`} />
      <span className={`font-medium ${isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
        {current} / {max} {entity}
      </span>
    </div>
  )
}

// Modal/dialog version
export function DataLimitDialog({
  isOpen,
  onClose,
  current,
  max,
  entity,
}: {
  isOpen: boolean
  onClose: () => void
  current: number
  max: number
  entity: 'tasks' | 'tags' | 'subtasks' | 'task tags'
}) {
  if (!isOpen) return null

  const percentage = (current / max) * 100
  const isAtLimit = percentage >= 100

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isAtLimit ? `${entity.charAt(0).toUpperCase() + entity.slice(1)} Limit Reached` : 'Approaching Limit'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isAtLimit
                ? `You've reached the maximum of ${max.toLocaleString()} ${entity}. You won't be able to create more until you delete some existing ones.`
                : `You're using ${current.toLocaleString()} of ${max.toLocaleString()} ${entity}. Consider cleaning up to avoid hitting the limit.`}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-700 dark:text-gray-300">
              {current.toLocaleString()} / {max.toLocaleString()}
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${isAtLimit ? 'bg-red-600' : 'bg-yellow-600'} rounded-full`}
            />
          </div>
        </div>

        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          I Understand
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
