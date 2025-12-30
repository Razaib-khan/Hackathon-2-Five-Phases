'use client';

/**
 * Task Filters Component
 *
 * Provides filtering and search options:
 * - Search input
 * - Completion status filter (All, Active, Completed)
 * - Sort options
 */

import type { TaskFilters } from '@/types';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function TaskFiltersComponent({ filters, onFiltersChange }: TaskFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined, page: 1 });
  };

  const handleStatusChange = (completed: boolean | undefined) => {
    onFiltersChange({ ...filters, completed, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort_by, sort_order] = e.target.value.split(':') as [
      TaskFilters['sort_by'],
      TaskFilters['sort_order']
    ];
    onFiltersChange({ ...filters, sort_by, sort_order, page: 1 });
  };

  const currentSort = `${filters.sort_by || 'created_at'}:${filters.sort_order || 'desc'}`;

  return (
    <div className="space-y-4 mb-6">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="input pl-10"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filter and sort controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status filter */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleStatusChange(undefined)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filters.completed === undefined
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusChange(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filters.completed === false
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusChange(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filters.completed === true
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Sort dropdown */}
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="input py-1.5 px-3 text-sm"
        >
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="title:asc">Title A-Z</option>
          <option value="title:desc">Title Z-A</option>
          <option value="completed:asc">Incomplete first</option>
          <option value="completed:desc">Completed first</option>
        </select>
      </div>
    </div>
  );
}
