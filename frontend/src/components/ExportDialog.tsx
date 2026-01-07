/**
 * Export Dialog Component
 *
 * Provides UI for exporting tasks:
 * - JSON format export
 * - CSV format export
 * - Include/exclude completed tasks option
 * - Download progress indication
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, FileJson, FileSpreadsheet, X, CheckCircle } from 'lucide-react'
import { slideUpVariants, fadeVariants } from '@/lib/animations'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function ExportDialog({ isOpen, onClose, userId }: ExportDialogProps) {
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | null>(null)

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    setExportFormat(format)
    setExportSuccess(false)

    try {
      // Get auth token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Build URL
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const url = new URL(`${baseUrl}/api/export/tasks/${format}`)
      url.searchParams.append('include_completed', includeCompleted.toString())

      // Fetch export
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `aido_tasks.${format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match) {
          filename = match[1]
        }
      }

      // Download file
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      // Show success
      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export tasks. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

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

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Export Tasks
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                {/* Success Message */}
                <AnimatePresence>
                  {exportSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        Export completed successfully!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Options */}
                <div className="space-y-4">
                  {/* Include Completed Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCompleted}
                      onChange={(e) => setIncludeCompleted(e.target.checked)}
                      disabled={isExporting}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Include completed tasks
                    </span>
                  </label>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a format to download your tasks:
                  </p>

                  {/* Export Buttons */}
                  <div className="space-y-3">
                    {/* JSON Export */}
                    <motion.button
                      onClick={() => handleExport('json')}
                      disabled={isExporting}
                      whileHover={!isExporting ? { scale: 1.02 } : undefined}
                      whileTap={!isExporting ? { scale: 0.98 } : undefined}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Export as JSON
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Structured data with tags and subtasks
                        </p>
                      </div>
                      {isExporting && exportFormat === 'json' && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </motion.button>

                    {/* CSV Export */}
                    <motion.button
                      onClick={() => handleExport('csv')}
                      disabled={isExporting}
                      whileHover={!isExporting ? { scale: 1.02 } : undefined}
                      whileTap={!isExporting ? { scale: 0.98 } : undefined}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Export as CSV
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Spreadsheet format for Excel/Google Sheets
                        </p>
                      </div>
                      {isExporting && exportFormat === 'csv' && (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your data will be downloaded to your device. No data is sent to external servers.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
