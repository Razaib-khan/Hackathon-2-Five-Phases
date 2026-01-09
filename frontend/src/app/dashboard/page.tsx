'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import NotificationList from '../../components/notifications/NotificationList';
import TaskList from '../../components/tasks/TaskList';
import TaskForm from '../../components/tasks/TaskForm';
import { Task } from '../../lib/types';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">Please sign in to access the dashboard.</p>
      </div>
    );
  }

  const handleTaskCreated = (task: Task) => {
    // Refresh the task list if needed
    setShowCreateTaskModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your AIDO dashboard, {user.username}</p>

        <div className="mt-4 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 min-w-max sm:space-x-0 sm:min-w-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                <button
                  onClick={() => setShowCreateTaskModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <TaskForm
                onSuccess={handleTaskCreated}
                onCancel={() => setShowCreateTaskModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                >
                  Create Task
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md">
                  Create Task
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md">
                  View All Tasks
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md">
                  Filter by Priority
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-md">
                  Completed Tasks
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md">
                  Notifications
                </button>
                <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-md">
                  Profile
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Tasks</h2>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All
                </button>
              </div>

              <TaskList />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                <NotificationList />
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                  <p className="text-sm font-medium text-blue-800">New phase started</p>
                  <p className="text-xs text-blue-600">Development phase has begun for Global Innovation Challenge</p>
                </div>

                <div className="p-3 bg-green-50 rounded border border-green-100">
                  <p className="text-sm font-medium text-green-800">Team invite received</p>
                  <p className="text-xs text-green-600">You've been invited to join 'Innovators United'</p>
                </div>

                <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
                  <p className="text-sm font-medium text-yellow-800">Deadline approaching</p>
                  <p className="text-xs text-yellow-600">Submission deadline in 3 days</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">My Profile</h2>

              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <p className="text-gray-600 capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Joined:</span>
                  <p className="text-gray-600">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
              >
                Create Task
              </button>
            </div>

            <TaskList />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Task Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-2xl font-bold text-blue-600">12</h3>
                <p className="text-gray-600">Total Tasks</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-2xl font-bold text-green-600">8</h3>
                <p className="text-gray-600">Completed</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-2xl font-bold text-red-600">4</h3>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Priority Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">4</div>
                <p className="text-sm text-gray-600">High</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">3</div>
                <p className="text-sm text-gray-600">Medium</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-500">2</div>
                <p className="text-sm text-gray-600">Low</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}