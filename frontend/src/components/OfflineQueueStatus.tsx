/**
 * Offline Queue Status Component
 *
 * Shows offline queue status and sync progress:
 * - Number of pending operations
 * - Sync button
 * - Auto-sync indicator
 * - Clear queue option
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { CloudOff, Cloud, RefreshCw, Trash2, CheckCircle } from 'lucide-react'
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue'
import { slideDownVariants } from '@/lib/animations'

interface OfflineQueueStatusProps {
  className?: string
}

export function OfflineQueueStatus({ className = '' }: OfflineQueueStatusProps) {
  const { queue, queueLength, isOnline, isSyncing, syncQueue, clearQueue } = useOfflineQueue()

  // Don't show if queue is empty and online
  if (queueLength === 0 && isOnline) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={slideDownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {isOnline ? (
              <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <CloudOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isOnline ? 'Sync Status' : 'Offline Mode'}
            </h3>
          </div>

          {/* Status */}
          {queueLength > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {queueLength} {queueLength === 1 ? 'operation' : 'operations'} pending
              </p>

              {/* Operation List Preview */}
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 max-h-24 overflow-y-auto">
                {queue.slice(0, 3).map((op) => (
                  <div key={op.id} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    <span>
                      {op.type} {op.resource}
                      {op.retries > 0 && ` (retry ${op.retries})`}
                    </span>
                  </div>
                ))}
                {queue.length > 3 && (
                  <div className="text-gray-500">
                    +{queue.length - 3} more...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={syncQueue}
                  disabled={isSyncing || !isOnline}
                  whileHover={!isSyncing && isOnline ? { scale: 1.05 } : undefined}
                  whileTap={!isSyncing && isOnline ? { scale: 0.95 } : undefined}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <motion.div
                    animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                    transition={isSyncing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  {isSyncing ? 'Syncing...' : isOnline ? 'Sync Now' : 'Offline'}
                </motion.button>

                <motion.button
                  onClick={clearQueue}
                  disabled={isSyncing}
                  whileHover={!isSyncing ? { scale: 1.05 } : undefined}
                  whileTap={!isSyncing ? { scale: 0.95 } : undefined}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Clear queue"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>

              {!isOnline && (
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Changes will sync automatically when back online
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <p className="text-sm">All synced</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
