'use client';

/**
 * Tasks Page
 *
 * Main task management interface with:
 * - Task list with CRUD operations
 * - Filtering and search
 * - Create/edit modal
 * - Delete confirmation
 * - Auth protection
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/lib/hooks/useTasks';
import { getTasks } from '@/lib/api';
import { TaskList, TaskForm, TaskFiltersComponent, Modal } from '@/components';
import type { Task, TaskFilters, TaskCreateRequest, TaskUpdateRequest } from '@/types';
import WebsiteLogo from '@/components/WebsiteLogo';

export default function TasksPage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { tasks: hookTasks, total: hookTotal, isLoading: hookLoading, error: hookError, fetchTasks: hookFetchTasks, createTask, updateTask, deleteTask, toggleComplete } = useTasks();

  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sync hook state to local state
  useEffect(() => {
    setTasks(hookTasks);
    setTotal(hookTotal);
    if (hookError) {
      setError(hookError.message || 'An error occurred');
    }
    setIsLoading(hookLoading);
  }, [hookTasks, hookTotal, hookLoading, hookError]);

  // Filter state
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    page_size: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      await hookFetchTasks(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    }
  }, [user, hookFetchTasks, filters]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Create task
  const handleCreate = async (data: TaskCreateRequest) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createTask(data);
      setShowCreateModal(false);
      fetchTasks();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task
  const handleUpdate = async (data: TaskUpdateRequest) => {
    if (!user || !editingTask) return;

    setIsSubmitting(true);
    try {
      await updateTask(editingTask.id.toString(), data);
      setEditingTask(null);
      fetchTasks();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle completion
  const handleToggleComplete = async (task: Task) => {
    if (!user) return;

    // Toggle status between 'todo' and 'done' based on current status
    const newStatus = task.status === 'done' ? 'todo' : 'done';

    try {
      const success = await toggleComplete(task.id.toString());
      if (success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Delete task
  const handleDelete = async () => {
    if (!user || !deletingTask) return;

    try {
      const success = await deleteTask(deletingTask.id.toString());
      if (success) {
        setDeletingTask(null);
        fetchTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <WebsiteLogo size="navbar" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-gray-600">
              {total} {total === 1 ? 'task' : 'tasks'} total
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onToggleComplete={handleToggleComplete}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
        />

        {/* Pagination */}
        {total > filters.page_size! && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={filters.page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {filters.page} of {Math.ceil(total / (filters.page_size || 20))}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={(filters.page || 1) * (filters.page_size || 20) >= total}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Task"
      >
        <TaskForm
          onSubmit={handleCreate as (data: TaskCreateRequest | TaskUpdateRequest) => Promise<void>}
          onCancel={() => setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={handleUpdate as (data: TaskCreateRequest | TaskUpdateRequest) => Promise<void>}
            onCancel={() => setEditingTask(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete &quot;{deletingTask?.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeletingTask(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
