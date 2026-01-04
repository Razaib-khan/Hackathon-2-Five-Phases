/**
 * Offline Indicator Component
 *
 * Monitors network connection and displays:
 * - Online/offline status
 * - Toast notifications on status change
 * - Persistent banner when offline
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff, Wifi } from 'lucide-react'
import { slideDownVariants } from '@/lib/animations'

interface OfflineIndicatorProps {
  showOnlineToast?: boolean
  position?: 'top' | 'bottom'
}

export function OfflineIndicator({
  showOnlineToast = false,
  position = 'top',
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine)

    // Event handlers
    const handleOnline = () => {
      setIsOnline(true)
      if (showOnlineToast) {
        setShowOnlineMessage(true)
        setTimeout(() => setShowOnlineMessage(false), 3000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineMessage(false)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showOnlineToast])

  const positionStyles = position === 'top' ? 'top-0' : 'bottom-0'

  return (
    <>
      {/* Offline banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed ${positionStyles} left-0 right-0 z-50`}
          >
            <div className="bg-red-600 text-white px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                <WifiOff className="w-5 h-5" />
                <span className="text-sm font-medium">
                  You're offline. Some features may not work.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online notification (toast) */}
      <AnimatePresence>
        {showOnlineMessage && (
          <motion.div
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-medium">Back online</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact offline indicator (icon only)
export function CompactOfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm"
    >
      <WifiOff className="w-4 h-4" />
      <span className="font-medium">Offline</span>
    </motion.div>
  )
}
