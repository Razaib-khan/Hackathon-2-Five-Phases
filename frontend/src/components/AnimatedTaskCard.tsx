/**
 * Animated Task Card Wrapper
 *
 * Wraps TaskCard with motion animations for:
 * - Entrance/exit animations
 * - Hover effects
 * - Drag feedback
 * - Success/error animations
 */

'use client'

import { motion, AnimatePresence } from 'motion/react'
import { TaskCard } from './TaskCard'
import { scaleVariants, cardAnimations } from '@/lib/animations'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low' | 'none'
  due_date?: string
  status: 'todo' | 'in_progress' | 'done'
  time_spent: number
  tags?: Array<{ id: string; name: string; color: string }>
  subtask_count?: number
  completed_subtask_count?: number
}

interface AnimatedTaskCardProps {
  task: Task
  onToggleComplete?: (taskId: string) => void
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onClick?: (taskId: string) => void
  compact?: boolean
  delay?: number
}

export function AnimatedTaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
  compact = false,
  delay = 0,
}: AnimatedTaskCardProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={task.id}
        variants={scaleVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={cardAnimations.hover}
        whileTap={cardAnimations.tap}
        layout
        transition={{
          layout: { type: 'spring', stiffness: 300, damping: 30 },
          delay: delay,
        }}
      >
        <TaskCard
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          compact={compact}
        />
      </motion.div>
    </AnimatePresence>
  )
}
