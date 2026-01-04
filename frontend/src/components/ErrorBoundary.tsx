/**
 * Error Boundary Component
 *
 * Catches React errors and provides:
 * - Friendly error messages
 * - Error details in development
 * - Recovery actions
 * - Error reporting
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { fadeVariants } from '@/lib/animations'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <motion.div
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4"
        >
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Oops! Something went wrong
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We encountered an unexpected error. Don't worry, your data is safe.
                  You can try refreshing the page or going back to the dashboard.
                </p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                    <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={this.handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </motion.button>

                  <motion.button
                    onClick={this.handleReload}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </motion.button>

                  <motion.button
                    onClick={this.handleGoHome}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}
