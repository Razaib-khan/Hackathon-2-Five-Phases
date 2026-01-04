/**
 * KanbanView Component
 *
 * Kanban board view with:
 * - Three columns: To Do, In Progress, Done
 * - Drag-and-drop between columns (updates task.status)
 * - Task cards with all metadata
 * - Column task counts
 * - Empty state per column
 * - Smooth animations with Motion
 * - Uses @dnd-kit for drag-and-drop
 *
 * Implements: FR-023 (Kanban View)
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'motion/react'
import { useTasks, Task } from '@/lib/hooks/useTasks'
import { useFilters } from '@/contexts/FilterContext'
import { TaskCard } from '../TaskCard'
import { Loader2, Plus } from 'lucide-react'
import { fadeVariants, scaleVariants } from '@/lib/animations'

interface KanbanViewProps {
  userId: string
  onTaskClick?: (taskId: string) => void
}

type StatusColumn = 'todo' | 'in_progress' | 'done'

const COLUMNS: Array<{ id: StatusColumn; label: string; color: string }> = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'done', label: 'Done', color: 'bg-green-100 dark:bg-green-900' },
]

function SortableTaskCard({
  task,
  onToggleComplete,
  onClick,
}: {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onClick: (taskId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        scale: isDragging ? 1.05 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
      className={isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}
    >
      <TaskCard
        task={task}
        onToggleComplete={(taskId) => onToggleComplete(taskId, task.completed)}
        onClick={onClick}
        compact={false}
      />
    </motion.div>
  )
}

export function KanbanView({ userId, onTaskClick }: KanbanViewProps) {
  const { tasks, total, isLoading, error, fetchTasks, updateTask, toggleComplete } = useTasks()
  const { filters } = useFilters()

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks(userId, filters)
  }, [userId, filters, fetchTasks])

  // Group tasks by status
  const tasksByStatus: Record<StatusColumn, Task[]> = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as StatusColumn

    const task = tasks.find((t) => t.id === taskId)

    if (!task || task.status === newStatus) return

    // Update task status
    await updateTask(userId, taskId, { status: newStatus })

    // If moving to "done", mark as completed
    if (newStatus === 'done' && !task.completed) {
      await updateTask(userId, taskId, { completed: true })
    }

    // If moving away from "done", mark as incomplete
    if (task.status === 'done' && newStatus !== 'done' && task.completed) {
      await updateTask(userId, taskId, { completed: false })
    }
  }

  const handleTaskClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    }
  }

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    toggleComplete(userId, taskId)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load tasks</p>
        <button
          onClick={() => fetchTasks(userId, filters)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Task count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total} {total === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => {
            const columnTasks = tasksByStatus[column.id]

            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className={`${column.color} rounded-t-lg px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {column.label}
                    </h3>
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Content (Drop Zone) */}
                <SortableContext
                  id={column.id}
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-b-lg p-4 min-h-[400px] space-y-3 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
                          No tasks in {column.label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Drag tasks here or create a new one
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onClick={handleTaskClick}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard
                task={activeTask}
                onToggleComplete={handleToggleComplete}
                onClick={handleTaskClick}
                compact={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No tasks found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create a new task or adjust your filters
          </p>
        </div>
      )}
    </div>
  )
}
