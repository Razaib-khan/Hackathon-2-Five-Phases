'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../notifications/NotificationProvider';
import { Task } from '../../lib/types';
import TaskCard from './TaskCard';

interface PriorityStats {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface PriorityOverview {
  low: Task[];
  medium: Task[];
  high: Task[];
  critical: Task[];
}

const PriorityManagement = () => {
  const { api } = useAuth();
  const { addNotification } = useNotifications();
  const [priorityStats, setPriorityStats] = useState<PriorityStats>({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  });
  const [priorityOverview, setPriorityOverview] = useState<PriorityOverview>({
    low: [],
    medium: [],
    high: [],
    critical: []
  });
  const [loading, setLoading] = useState(true);
  const [expandedPriorities, setExpandedPriorities] = useState<Record<string, boolean>>({
    critical: true,
    high: true,
    medium: false,
    low: false
  });

  useEffect(() => {
    fetchPriorityData();
  }, []);

  const fetchPriorityData = async () => {
    try {
      setLoading(true);

      // Fetch priority statistics
      const statsResponse = await api.get('/priority/statistics');
      setPriorityStats(statsResponse.data.by_priority);

      // Fetch tasks for each priority level
      const priorities = ['critical', 'high', 'medium', 'low'];
      const overview: PriorityOverview = {
        low: [],
        medium: [],
        high: [],
        critical: []
      };

      for (const priority of priorities) {
        try {
          const response = await api.get(`/priority/tasks/${priority}?limit=100`);
          overview[priority as keyof PriorityOverview] = response.data;
        } catch (error) {
          console.error(`Error fetching ${priority} tasks:`, error);
        }
      }

      setPriorityOverview(overview);
    } catch (error) {
      console.error('Error fetching priority data:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to load priority data',
        type: 'announcement'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    // Update the state to reflect the change
    setPriorityOverview(prev => {
      const newState = { ...prev };

      // Remove the task from its previous priority group
      Object.keys(newState).forEach(priority => {
        newState[priority as keyof PriorityOverview] = newState[priority as keyof PriorityOverview].filter(
          task => task.id !== updatedTask.id
        );
      });

      // Add the task to its new priority group
      const priorityKey = updatedTask.priority as keyof PriorityOverview;
      newState[priorityKey] = [...newState[priorityKey], updatedTask];

      return newState;
    });
  };

  const handleTaskDelete = (taskId: string) => {
    // Remove the task from the state
    setPriorityOverview(prev => {
      const newState = { ...prev };

      Object.keys(newState).forEach(priority => {
        newState[priority as keyof PriorityOverview] = newState[priority as keyof PriorityOverview].filter(
          task => task.id !== taskId
        );
      });

      return newState;
    });
  };

  const togglePrioritySection = (priority: string) => {
    setExpandedPriorities(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityDisplayName = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Priority Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(priorityStats).map(([priority, count]) => (
            <div
              key={priority}
              className={`border rounded-lg p-4 text-center cursor-pointer transition-colors hover:bg-opacity-80 ${getPriorityColor(priority)}`}
              onClick={() => togglePrioritySection(priority)}
            >
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm uppercase tracking-wide">{getPriorityDisplayName(priority)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Priority Section */}
      {expandedPriorities.critical && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor('critical')}`}>
              Critical Priority Tasks ({priorityOverview.critical.length})
            </h3>
          </div>

          {priorityOverview.critical.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityOverview.critical.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No critical priority tasks</p>
            </div>
          )}
        </div>
      )}

      {/* High Priority Section */}
      {expandedPriorities.high && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor('high')}`}>
              High Priority Tasks ({priorityOverview.high.length})
            </h3>
          </div>

          {priorityOverview.high.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityOverview.high.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No high priority tasks</p>
            </div>
          )}
        </div>
      )}

      {/* Medium Priority Section */}
      {expandedPriorities.medium && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor('medium')}`}>
              Medium Priority Tasks ({priorityOverview.medium.length})
            </h3>
          </div>

          {priorityOverview.medium.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityOverview.medium.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No medium priority tasks</p>
            </div>
          )}
        </div>
      )}

      {/* Low Priority Section */}
      {expandedPriorities.low && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor('low')}`}>
              Low Priority Tasks ({priorityOverview.low.length})
            </h3>
          </div>

          {priorityOverview.low.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorityOverview.low.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No low priority tasks</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriorityManagement;