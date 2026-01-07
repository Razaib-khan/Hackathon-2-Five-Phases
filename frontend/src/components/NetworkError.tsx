/**
 * Network Error Components
 *
 * Provides UI for network-related errors:
 * - Connection errors
 * - Timeout errors
 * - Retry mechanisms
 * - Offline detection
 */

'use client'

import { motion } from 'motion/react'
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { fadeVariants, bounceVariants } from '@/lib/animations'

interface NetworkErrorProps {
  onRetry: () => void
  isRetrying?: boolean
  message?: string
  showDetails?: boolean
  errorDetails?: string
}

export function NetworkError({
  onRetry,
  isRetrying = false,
  message = 'Unable to connect to the server',
  showDetails = false,
  errorDetails,
}: NetworkErrorProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">
            Connection Error
          </h3>
          <p className="text-red-700 dark:text-red-300 text-sm mb-4">{message}</p>

          {showDetails && errorDetails && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/20 rounded p-3">
              <p className="text-xs font-mono text-red-700 dark:text-red-300">
                {errorDetails}
              </p>
            </div>
          )}

          <motion.button
            onClick={onRetry}
            disabled={isRetrying}
            whileHover={!isRetrying ? { scale: 1.02 } : undefined}
            whileTap={!isRetrying ? { scale: 0.98 } : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors"
          >
            <motion.div
              animate={isRetrying ? { rotate: 360 } : { rotate: 0 }}
              transition={isRetrying ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {isRetrying ? 'Retrying...' : 'Retry'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Inline network error (compact version)
export function InlineNetworkError({ onRetry, isRetrying = false }: Pick<NetworkErrorProps, 'onRetry' | 'isRetrying'>) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-700 dark:text-red-300">
          Failed to load data
        </span>
      </div>

      <motion.button
        onClick={onRetry}
        disabled={isRetrying}
        whileHover={!isRetrying ? { scale: 1.05 } : undefined}
        whileTap={!isRetrying ? { scale: 0.95 } : undefined}
        className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
      >
        {isRetrying ? 'Retrying...' : 'Retry'}
      </motion.button>
    </motion.div>
  )
}

// Empty state with network error
export function EmptyStateNetworkError({ onRetry, isRetrying = false }: Pick<NetworkErrorProps, 'onRetry' | 'isRetrying'>) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Unable to Load Data
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
        We're having trouble connecting to the server. Please check your internet connection and try again.
      </p>

      <motion.button
        onClick={onRetry}
        disabled={isRetrying}
        whileHover={!isRetrying ? { scale: 1.02 } : undefined}
        whileTap={!isRetrying ? { scale: 0.98 } : undefined}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
      >
        <motion.div
          animate={isRetrying ? { rotate: 360 } : { rotate: 0 }}
          transition={isRetrying ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>
        {isRetrying ? 'Retrying...' : 'Try Again'}
      </motion.button>
    </motion.div>
  )
}

// Timeout error
export function TimeoutError({ onRetry, isRetrying = false }: Pick<NetworkErrorProps, 'onRetry' | 'isRetrying'>) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Request Timeout
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
            The request took too long to complete. This might be due to a slow connection or server issues.
          </p>

          <motion.button
            onClick={onRetry}
            disabled={isRetrying}
            whileHover={!isRetrying ? { scale: 1.02 } : undefined}
            whileTap={!isRetrying ? { scale: 0.98 } : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
