'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/lib/api';
import { getTasks, updateTask, deleteTask } from '@/lib/api';
import TaskForm from './TaskForm';

interface TaskListProps {
  onTaskUpdated?: () => void;
}

const TaskList = ({ onTaskUpdated }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    if (onTaskUpdated) onTaskUpdated();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
        if (onTaskUpdated) onTaskUpdated();
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Task
        </button>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
          onTaskSaved={editingTask ? handleTaskUpdated : handleTaskCreated}
        />
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Add your first task!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-4 border rounded-md ${
                task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <h3
                    className={`font-medium ${
                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;