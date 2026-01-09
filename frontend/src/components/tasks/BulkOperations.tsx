import React, { useState } from 'react';
import { TaskPriority, TaskStatus } from '../../types';

interface BulkOperationsProps {
  selectedTaskIds: string[];
  onBulkUpdate: (action: string, value: any) => void;
  onBulkDelete: () => void;
  disabled?: boolean;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedTaskIds,
  onBulkUpdate,
  onBulkDelete,
  disabled = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  const handleActionChange = (action: string) => {
    setBulkAction(action);
    setBulkValue('');
  };

  const handleApplyAction = () => {
    if (!bulkAction || !selectedTaskIds.length) return;

    switch (bulkAction) {
      case 'status':
        onBulkUpdate('status', bulkValue);
        break;
      case 'priority':
        onBulkUpdate('priority', bulkValue);
        break;
      case 'assign':
        onBulkUpdate('assigned_to', bulkValue);
        break;
      case 'complete':
        onBulkUpdate('status', 'COMPLETED');
        break;
      case 'delete':
        onBulkDelete();
        break;
      default:
        break;
    }

    // Reset after action
    setBulkAction('');
    setBulkValue('');
    setShowActions(false);
  };

  if (selectedTaskIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-medium text-blue-800">
            {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            {!showActions ? (
              <>
                <button
                  onClick={() => setShowActions(true)}
                  disabled={disabled}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    disabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  Bulk Actions
                </button>
                <button
                  onClick={onBulkDelete}
                  disabled={disabled}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    disabled
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  Delete Selected
                </button>
              </>
            ) : (
              <>
                <select
                  value={bulkAction}
                  onChange={(e) => handleActionChange(e.target.value)}
                  className="block w-full min-w-[150px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Action</option>
                  <option value="status">Update Status</option>
                  <option value="priority">Update Priority</option>
                  <option value="assign">Assign To</option>
                  <option value="complete">Mark Complete</option>
                  <option value="delete">Delete</option>
                </select>

                {bulkAction === 'status' && (
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="block w-full min-w-[150px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                )}

                {bulkAction === 'priority' && (
                  <select
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    className="block w-full min-w-[150px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                )}

                {bulkAction === 'assign' && (
                  <input
                    type="text"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(e.target.value)}
                    placeholder="User ID"
                    className="block w-full min-w-[150px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  />
                )}

                {(bulkAction === 'status' || bulkAction === 'priority' || bulkAction === 'assign') && (
                  <button
                    onClick={handleApplyAction}
                    disabled={!bulkValue}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      !bulkValue
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    Apply
                  </button>
                )}

                {(bulkAction === 'complete' || bulkAction === 'delete') && (
                  <button
                    onClick={handleApplyAction}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Apply
                  </button>
                )}

                <button
                  onClick={() => setShowActions(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;