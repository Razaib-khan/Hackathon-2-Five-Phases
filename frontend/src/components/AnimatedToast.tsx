/**
 * Animated Toast Notifications
 *
 * Provides animated toast notifications with:
 * - Slide in from top/bottom
 * - Success/error/info/warning variants
 * - Auto-dismiss
 * - Progress bar
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { slideDownVariants } from '@/lib/animations'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface AnimatedToastProps {
  toast: Toast
  onClose: (id: string) => void
}

export function AnimatedToast({ toast, onClose }: AnimatedToastProps) {
  const [progress, setProgress] = useState(100)
  const duration = toast.duration || 5000

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        onClose(toast.id)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [toast.id, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  }

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <motion.div
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`
        relative overflow-hidden
        w-96 max-w-full rounded-lg shadow-lg border
        ${colors[toast.type]}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{icons[toast.type]}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}
          </div>

          <motion.button
            onClick={() => onClose(toast.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div
        className={`h-1 ${progressColors[toast.type]}`}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: progress / 100 }}
        style={{ transformOrigin: 'left' }}
        transition={{ duration: 0.05, ease: 'linear' }}
      />
    </motion.div>
  )
}

// Toast container
interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastContainer({
  toasts,
  onClose,
  position = 'top-right',
}: ToastContainerProps) {
  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <div className={`fixed ${positionStyles[position]} z-50 flex flex-col gap-2`}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <AnimatedToast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}
