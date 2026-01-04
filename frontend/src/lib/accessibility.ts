/**
 * Accessibility Utilities
 *
 * Helpers for WCAG 2.1 AA compliance:
 * - Keyboard navigation
 * - Screen reader announcements
 * - Focus management
 * - ARIA attributes
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Trap focus within an element (for modals)
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)

  // Focus first element
  firstFocusable?.focus()

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Get accessible label for form input
 */
export function getAriaLabel(label: string, required: boolean = false, description?: string): {
  'aria-label': string
  'aria-required'?: boolean
  'aria-describedby'?: string
} {
  const attrs: any = {
    'aria-label': label,
  }

  if (required) {
    attrs['aria-required'] = true
  }

  if (description) {
    const descId = `desc-${label.toLowerCase().replace(/\s+/g, '-')}`
    attrs['aria-describedby'] = descId
  }

  return attrs
}

/**
 * Keyboard navigation helper
 */
export const KeyboardShortcuts = {
  // Arrow navigation
  handleArrowNavigation: (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault()
        newIndex = (currentIndex + 1) % items.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = (currentIndex - 1 + items.length) % items.length
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect(currentIndex)
        return
      default:
        return
    }

    items[newIndex]?.focus()
    onSelect(newIndex)
  },

  // Escape to close
  handleEscape: (e: React.KeyboardEvent, onClose: () => void) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  },
}

/**
 * Color contrast checker (WCAG AA requires 4.5:1 for normal text)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    // Convert hex to RGB
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  const ratio = getContrastRatio(foreground, background)
  return ratio >= 4.5
}

/**
 * Focus visible class for keyboard navigation
 */
export const focusVisibleClass = 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none'

/**
 * Screen reader only class
 */
export const srOnlyClass = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0'
