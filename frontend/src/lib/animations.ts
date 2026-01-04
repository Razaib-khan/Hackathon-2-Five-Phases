/**
 * Animation utilities and variants for Motion
 *
 * Provides:
 * - Reusable animation variants
 * - Spring configurations
 * - Transition presets
 * - Easing functions
 */

import type { Transition, Variants } from 'motion/react'

// Spring configurations
export const springs = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  bouncy: { type: 'spring', stiffness: 500, damping: 20 },
  smooth: { type: 'spring', stiffness: 200, damping: 25 },
} as const

// Transition presets
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' },
  normal: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
} as const

// Fade variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
}

// Slide variants
export const slideVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: springs.gentle },
  exit: { opacity: 0, x: 20, transition: transitions.fast },
}

// Scale variants
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: springs.gentle },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
}

// Pop variants (for buttons, cards)
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: springs.snappy },
  exit: { opacity: 0, scale: 0.8, transition: transitions.fast },
}

// Slide up variants (for modals, dialogs)
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
  exit: { opacity: 0, y: 30, transition: transitions.fast },
}

// Slide down variants (for dropdowns, menus)
export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
}

// Collapse variants (for expanding/collapsing sections)
export const collapseVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: springs.gentle },
  exit: { height: 0, opacity: 0, transition: transitions.fast },
}

// Stagger children animation
export const staggerContainer: Variants = {
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
}

// List item variants (for use with staggerContainer)
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: springs.gentle },
  exit: { opacity: 0, x: 10, transition: transitions.fast },
}

// Bounce variants (for success animations)
export const bounceVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: springs.bouncy,
  },
}

// Shake variants (for error animations)
export const shakeVariants: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
}

// Pulse variants (for loading states)
export const pulseVariants: Variants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Drag animation config
export const dragConfig = {
  drag: true,
  dragConstraints: { top: 0, left: 0, right: 0, bottom: 0 },
  dragElastic: 0.1,
  dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
} as const

// Hover/tap animations
export const interactionAnimations = {
  hover: { scale: 1.05, transition: transitions.fast },
  tap: { scale: 0.95, transition: transitions.fast },
} as const

// Button animations
export const buttonAnimations = {
  hover: { scale: 1.02, transition: transitions.fast },
  tap: { scale: 0.98, transition: transitions.fast },
} as const

// Card animations
export const cardAnimations = {
  hover: { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', transition: springs.gentle },
  tap: { scale: 0.98, transition: transitions.fast },
} as const
