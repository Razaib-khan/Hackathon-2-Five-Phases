/**
 * Utility Functions
 *
 * Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calculate time ago from date
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'

  return Math.floor(seconds) + ' seconds ago'
}
