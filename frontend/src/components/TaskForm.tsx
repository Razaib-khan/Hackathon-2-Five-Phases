'use client';

/**
 * Task Form Component
 *
 * Used for creating and editing tasks.
 * Features:
 * - Title input (required)
 * - Description textarea (optional)
 * - Form validation
 * - Loading state
 */

import { useState, useEffect } from 'react';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isSubmitting = false }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [error, setError] = useState('');

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (description && description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input mt-1"
          placeholder="What needs to be done?"
          maxLength={200}
          required
          autoFocus
        />
        <p className="mt-1 text-xs text-gray-500">{title.length}/200</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input mt-1"
          placeholder="Add details..."
          rows={3}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/1000</p>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : isEditing ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </button>
      </div>
    </form>
  );
}
