/**
 * Animated Button Components
 *
 * Provides interactive button animations for:
 * - Standard buttons
 * - Icon buttons
 * - Success/error feedback
 * - Loading states
 */

'use client'

import { motion } from 'motion/react'
import { buttonAnimations, bounceVariants, shakeVariants } from '@/lib/animations'
import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  feedback?: 'success' | 'error' | null
}

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  feedback = null,
  className,
  disabled,
  onDrag,
  onDragStart,
  onDragEnd,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const animationVariants = feedback === 'success'
    ? bounceVariants
    : feedback === 'error'
    ? shakeVariants
    : undefined

  return (
    <motion.button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      whileHover={!disabled && !isLoading ? buttonAnimations.hover : undefined}
      whileTap={!disabled && !isLoading ? buttonAnimations.tap : undefined}
      variants={animationVariants}
      animate={feedback ? 'animate' : 'initial'}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

interface AnimatedIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function AnimatedIconButton({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}: AnimatedIconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    default: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
  }

  const sizeStyles = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <motion.button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
