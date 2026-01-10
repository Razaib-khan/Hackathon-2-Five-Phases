import React, { useState, useEffect } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  filters: {
    search: string;
    status: string;
    priority: string;
    assignedToMe: boolean;
    createdByMe: boolean;
    dueDateFrom: string;
    dueDateTo: string;
    tags: string[];
  };
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, filters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      priority: '',
      assignedToMe: false,
      createdByMe: false,
      dueDateFrom: '',
      dueDateTo: '',
      tags: []
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={localFilters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Toggle for advanced filters */}
        <div className="flex items-end">
          <div className="w-full flex space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assigned to me */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.assignedToMe}
                onChange={(e) => handleFilterChange('assignedToMe', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Assigned to me</span>
            </label>
          </div>

          {/* Created by me */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.createdByMe}
                onChange={(e) => handleFilterChange('createdByMe', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Created by me</span>
            </label>
          </div>

          {/* Due date from */}
          <div>
            <label htmlFor="dueDateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Due From
            </label>
            <input
              type="date"
              id="dueDateFrom"
              value={localFilters.dueDateFrom}
              onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Due date to */}
          <div>
            <label htmlFor="dueDateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Due To
            </label>
            <input
              type="date"
              id="dueDateTo"
              value={localFilters.dueDateTo}
              onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;