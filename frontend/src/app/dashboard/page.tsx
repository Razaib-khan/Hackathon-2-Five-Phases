'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';
import TaskFilter from '@/components/tasks/TaskFilter';
import { Task } from '@/lib/api';
import { getTasks } from '@/lib/api';

const DashboardPage = () => {
  const { session, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState({
    priority: null as string | null,
    status: null as string | null,
    sortBy: 'newest'
  });

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/login');
    } else if (session) {
      fetchTasks();
    }
  }, [session, isLoading, router]);

  const fetchTasks = async () => {
    try {
      const tasksData = await getTasks();
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const applyFilters = () => {
    let result = [...tasks];

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply status filter
    if (filters.status) {
      if (filters.status === 'completed') {
        result = result.filter(task => task.completed);
      } else if (filters.status === 'pending') {
        result = result.filter(task => !task.completed);
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        result.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredTasks(result);
  };

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const handleFilterChange = (newFilters: {
    priority: string | null;
    status: string | null;
    sortBy: string;
  }) => {
    setFilters(newFilters);
  };

  const handleTaskUpdated = () => {
    fetchTasks(); // Refresh tasks after any update
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AIDO Dashboard</h1>
          <button
            onClick={signOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AIDO</h2>
          <p className="text-gray-600">Manage your tasks efficiently and boost your productivity.</p>
        </div>

        <TaskFilter onFilterChange={handleFilterChange} />

        <TaskList onTaskUpdated={handleTaskUpdated} />
      </main>
    </div>
  );
};

export default DashboardPage;