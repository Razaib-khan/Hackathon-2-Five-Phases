'use client';

import React, { useState } from 'react';

interface TaskFilterProps {
  onFilterChange: (filters: {
    priority: string | null;
    status: string | null;
    sortBy: string;
  }) => void;
}

const TaskFilter = ({ onFilterChange }: TaskFilterProps) => {
  const [priority, setPriority] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    onFilterChange({ priority: value === 'all' ? null : value, status, sortBy });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ priority, status: value === 'all' ? null : value, sortBy });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onFilterChange({ priority, status, sortBy: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-md">
      <div>
        <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Priority
        </label>
        <select
          id="priority-filter"
          value={priority}
          onChange={(e) => handlePriorityChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div>
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          id="sort-filter"
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority (High to Low)</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilter;