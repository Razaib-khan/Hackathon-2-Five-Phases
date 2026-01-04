/**
 * Keyboard Shortcuts Panel
 *
 * Shows available keyboard shortcuts:
 * - Global shortcuts
 * - View-specific shortcuts
 * - Accessibility features
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Keyboard, X } from 'lucide-react'
import { slideUpVariants, fadeVariants } from '@/lib/animations'
import { KeyboardShortcuts } from '@/lib/accessibility'

interface KeyboardShortcutsPanelProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = {
  global: [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['N'], description: 'Create new task' },
    { keys: ['F'], description: 'Focus search' },
    { keys: ['/'], description: 'Open filter panel' },
    { keys: ['Esc'], description: 'Close dialogs/panels' },
  ],
  navigation: [
    { keys: ['1'], description: 'Switch to List view' },
    { keys: ['2'], description: 'Switch to Kanban view' },
    { keys: ['3'], description: 'Switch to Calendar view' },
    { keys: ['4'], description: 'Switch to Matrix view' },
    { keys: ['A'], description: 'Go to Analytics' },
  ],
  tasks: [
    { keys: ['↑', '↓'], description: 'Navigate tasks' },
    { keys: ['Enter'], description: 'Open selected task' },
    { keys: ['Space'], description: 'Toggle task completion' },
    { keys: ['E'], description: 'Edit task' },
    { keys: ['Del'], description: 'Delete task' },
  ],
  accessibility: [
    { keys: ['Tab'], description: 'Navigate forward' },
    { keys: ['Shift', 'Tab'], description: 'Navigate backward' },
    { keys: ['Home'], description: 'Go to first item' },
    { keys: ['End'], description: 'Go to last item' },
  ],
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      KeyboardShortcuts.handleEscape(e as any, onClose)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
                  aria-label="Close shortcuts panel"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Global Shortcuts */}
                  <ShortcutSection title="Global" shortcuts={shortcuts.global} />

                  {/* Navigation Shortcuts */}
                  <ShortcutSection title="Navigation" shortcuts={shortcuts.navigation} />

                  {/* Task Shortcuts */}
                  <ShortcutSection title="Tasks" shortcuts={shortcuts.tasks} />

                  {/* Accessibility */}
                  <ShortcutSection title="Accessibility" shortcuts={shortcuts.accessibility} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">?</kbd> anytime to view this panel
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ShortcutSectionProps {
  title: string
  shortcuts: Array<{ keys: string[]; description: string }>
}

function ShortcutSection({ title, shortcuts }: ShortcutSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {shortcut.description}
            </span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-900 dark:text-gray-100 min-w-[2rem] text-center">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.keys.length - 1 && (
                    <span className="text-gray-400">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
