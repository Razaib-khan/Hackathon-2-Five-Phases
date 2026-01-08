/**
 * Dashboard Page
 *
 * Main task management interface with:
 * - Task view switcher (list/kanban/calendar/matrix)
 * - Filter panel
 * - Create task button
 * - Analytics widgets (stats, streak)
 * - Tag manager sidebar
 *
 * Integrates all core components and contexts.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useView } from '@/contexts/ViewContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { getStoredUser } from '@/lib/api'
import { ListView } from '@/components/views/ListView'
import { KanbanView } from '@/components/views/KanbanView'
import { CalendarView } from '@/components/views/CalendarView'
import { MatrixView } from '@/components/views/MatrixView'
import { TagManager } from '@/components/TagManager'
import { TaskDetailsDialog } from '@/components/TaskDetailsDialog'
import { FilterPanel } from '@/components/FilterPanel'
import { ExportDialog } from '@/components/ExportDialog'
import { KeyboardShortcutsPanel } from '@/components/KeyboardShortcutsPanel'
import { OfflineQueueStatus } from '@/components/OfflineQueueStatus'
import TaskCreationDialog from '@/components/TaskCreationDialog'
import WebsiteLogo from '@/components/WebsiteLogo'
import {
  LayoutList,
  LayoutGrid,
  Calendar,
  Grid3x3,
  Plus,
  Moon,
  Sun,
  Settings,
  BarChart3,
  Filter,
  Download,
  Keyboard,
} from 'lucide-react'

const VIEW_ICONS = {
  list: LayoutList,
  kanban: LayoutGrid,
  calendar: Calendar,
  matrix: Grid3x3,
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { viewMode, setViewMode } = useView()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { dashboard, fetchDashboard, isLoadingDashboard } = useAnalytics()

  const [userId, setUserId] = useState<string | null>(null)
  const [showTagManager, setShowTagManager] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getStoredUser()
      setUserId(user)
    }
    loadUser()
  }, [])

  useEffect(() => {
    fetchDashboard('all')
  }, [fetchDashboard])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '?':
          e.preventDefault()
          setShowKeyboardShortcuts(true)
          break
        case 'n':
        case 'N':
          e.preventDefault()
          setShowCreateTask(true)
          break
        case '/':
          e.preventDefault()
          setShowFilterPanel(true)
          break
        case '1':
          e.preventDefault()
          setViewMode('list')
          break
        case '2':
          e.preventDefault()
          setViewMode('kanban')
          break
        case '3':
          e.preventDefault()
          setViewMode('calendar')
          break
        case '4':
          e.preventDefault()
          setViewMode('matrix')
          break
        case 'a':
        case 'A':
          e.preventDefault()
          router.push('/dashboard/analytics')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router, setViewMode])

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <WebsiteLogo size="navbar" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Filter Panel Toggle */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Filter className="h-5 w-5" />
              </button>

              {/* Tag Manager Toggle */}
              <button
                onClick={() => setShowTagManager(!showTagManager)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Analytics */}
              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="View Analytics"
              >
                <BarChart3 className="h-5 w-5" />
              </button>

              {/* Export */}
              <button
                onClick={() => setShowExportDialog(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Export Tasks"
              >
                <Download className="h-5 w-5" />
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="h-5 w-5" />
              </button>

              {/* Create Task */}
              <button
                onClick={() => setShowCreateTask(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5" />
                New Task
              </button>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2 pb-4">
            {(Object.keys(VIEW_ICONS) as Array<keyof typeof VIEW_ICONS>).map((view) => {
              const Icon = VIEW_ICONS[view]
              const isActive = viewMode === view

              return (
                <button
                  key={view}
                  onClick={() => setViewMode(view)}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="capitalize">{view}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main View */}
          <div className="flex-1">
            {/* Stats Cards */}
            {dashboard && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.total_tasks}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {dashboard.completed_tasks}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {dashboard.due_today}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {dashboard.overdue_tasks}
                  </p>
                </div>
              </div>
            )}

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="mb-6">
                <FilterPanel isOpen={showFilterPanel} onClose={() => setShowFilterPanel(false)} />
              </div>
            )}

            {/* Task View */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {viewMode === 'list' && <ListView userId={userId} onTaskClick={setSelectedTaskId} />}
              {viewMode === 'kanban' && <KanbanView userId={userId} onTaskClick={setSelectedTaskId} />}
              {viewMode === 'calendar' && <CalendarView userId={userId} onTaskClick={setSelectedTaskId} />}
              {viewMode === 'matrix' && <MatrixView userId={userId} onTaskClick={setSelectedTaskId} />}
            </div>
          </div>

          {/* Sidebar */}
          {showTagManager && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-24">
                <TagManager />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Dialog */}
      {selectedTaskId && userId && (
        <TaskDetailsDialog
          taskId={selectedTaskId}
          userId={userId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Export Dialog */}
      {userId && (
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          userId={userId}
        />
      )}

      {/* Create Task Dialog */}
      {userId && (
        <TaskCreationDialog
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={() => {
            // Refresh the dashboard after task creation
            fetchDashboard('all');
          }}
          userId={userId}
        />
      )}

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Offline Queue Status */}
      <OfflineQueueStatus />
    </div>
  )
}
