import React, { useState, useEffect } from 'react';

interface SavedFilter {
  id: string;
  name: string;
  filter_config: any;
  is_default: boolean;
  created_at: string;
}

interface SavedFiltersProps {
  onSelectFilter: (filter: SavedFilter) => void;
  onSaveFilter: (name: string, config: any) => void;
  onDeleteFilter: (id: string) => void;
  onLoadFilters: () => Promise<SavedFilter[]>;
  onSetDefault: (id: string) => void;
}

const SavedFilters: React.FC<SavedFiltersProps> = ({
  onSelectFilter,
  onSaveFilter,
  onDeleteFilter,
  onLoadFilters,
  onSetDefault
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      setLoading(true);
      const filters = await onLoadFilters();
      setSavedFilters(filters);
    } catch (err) {
      setError('Failed to load saved filters');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this saved filter?')) {
      onDeleteFilter(id);
      setSavedFilters(savedFilters.filter(filter => filter.id !== id));
    }
  };

  const handleSetDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSetDefault(id);
    // Update the UI immediately
    setSavedFilters(prev => prev.map(filter => ({
      ...filter,
      is_default: filter.id === id
    })));
  };

  const handleSelectFilter = (filter: SavedFilter) => {
    onSelectFilter(filter);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="text-sm font-medium text-gray-700">Saved Filters</h3>
      </div>

      {savedFilters.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          No saved filters yet. Create and save filters to quickly access your favorite views.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {savedFilters.map((filter) => (
            <li
              key={filter.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => handleSelectFilter(filter)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{filter.name}</p>
                    <div className="mt-1 flex items-center space-x-2">
                      {filter.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(filter.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!filter.is_default && (
                    <button
                      onClick={(e) => handleSetDefault(filter.id, e)}
                      className="text-xs text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Set as default
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteFilter(filter.id, e)}
                    className="text-xs text-red-600 hover:text-red-900 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedFilters;