// frontend/src/components/TaskCreationDialog.tsx
// Task creation dialog component for the AIDO task management application

import React, { useState } from 'react';
import { TaskCreateRequest } from '@/models/task';
import { createTask } from '@/lib/api';
import TagSelector from '@/components/TagSelector';
import ToastNotification from '@/components/ToastNotification';
import { VALIDATION_RULES } from '@/lib/constants';

export interface TaskCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  userId: string; // Required for tag selection
}

const TaskCreationDialog: React.FC<TaskCreationDialogProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  userId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    estimatedTime: undefined as number | undefined,
    tags: [] as string[],
    category: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < VALIDATION_RULES.MIN_TASK_TITLE_LENGTH) {
      newErrors.title = `Title must be at least ${VALIDATION_RULES.MIN_TASK_TITLE_LENGTH} character(s)`;
    } else if (formData.title.trim().length > VALIDATION_RULES.MAX_TASK_TITLE_LENGTH) {
      newErrors.title = `Title must be ${VALIDATION_RULES.MAX_TASK_TITLE_LENGTH} characters or less`;
    }

    if (formData.description && formData.description.length > VALIDATION_RULES.MAX_TASK_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${VALIDATION_RULES.MAX_TASK_DESCRIPTION_LENGTH} characters or less`;
    }

    if (formData.estimatedTime !== undefined && formData.estimatedTime <= 0) {
      newErrors.estimatedTime = 'Estimated time must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData: TaskCreateRequest = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        due_date: formData.dueDate || undefined,
        estimated_time: formData.estimatedTime,
        tags: formData.tags,
        category: formData.category || undefined
      };

      await createTask(taskData);

      setToast({ type: 'success', message: 'Task created successfully!' });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedTime: undefined,
        tags: [],
        category: ''
      });

      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create task. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      estimatedTime: undefined,
      tags: [],
      category: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Priority
            </label>
            <div className="flex space-x-4">
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <label key={priority} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    checked={formData.priority === priority}
                    onChange={() => handleInputChange('priority', priority)}
                    className="mr-2"
                  />
                  <span className={`capitalize ${formData.priority === priority ? 'font-bold' : ''}`}>
                    {priority}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date Picker */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Estimated Time Field */}
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium mb-1">
              Estimated Time (minutes)
            </label>
            <input
              id="estimatedTime"
              type="number"
              value={formData.estimatedTime || ''}
              onChange={(e) => handleInputChange('estimatedTime', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter estimated time in minutes"
              className={`w-full p-2 border rounded-md ${errors.estimatedTime ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.estimatedTime && <p className="text-red-500 text-xs mt-1">{errors.estimatedTime}</p>}
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Enter category"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Tag Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags
            </label>
            <TagSelector
              selectedTagIds={formData.tags}
              onTagSelectionChange={(tagIds) => handleInputChange('tags', tagIds)}
              userId={userId}
              placeholder="Search or select tags..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TaskCreationDialog;