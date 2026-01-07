/**
 * Animated View Transition Component
 *
 * Provides smooth transitions when switching between view modes:
 * - List view
 * - Kanban view
 * - Calendar view
 * - Matrix view
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { fadeVariants } from '@/lib/animations'
import { ReactNode } from 'react'

interface AnimatedViewTransitionProps {
  children: ReactNode
  viewKey: string
  className?: string
}

export function AnimatedViewTransition({
  children,
  viewKey,
  className = '',
}: AnimatedViewTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Staggered list animation for list views
interface AnimatedListProps {
  children: ReactNode
  className?: string
}

export function AnimatedList({ children, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
          },
        },
        exit: {
          opacity: 0,
          transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated list item
export function AnimatedListItem({ children, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
        exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
