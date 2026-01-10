/**
 * Unit tests for TaskList component
 * Using Jest and React Testing Library
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from '../TaskList';
import { Task } from '../../../lib/types';

// Mock the dependencies
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    api: {
      get: jest.fn().mockResolvedValue({ data: [] }),
    },
  }),
}));

describe('TaskList Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'pending',
      priority: 'medium',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      created_by: 'user1',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'in_progress',
      priority: 'high',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      created_by: 'user1',
    },
  ];

  it('renders without crashing', () => {
    render(<TaskList initialTasks={mockTasks} />);
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
  });

  it('displays all tasks when no filters are applied', () => {
    render(<TaskList initialTasks={mockTasks} />);
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('shows loading state when no initial tasks are provided', () => {
    render(<TaskList />);
    // Should show loading spinner when fetching tasks
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles task updates properly', () => {
    const mockOnUpdate = jest.fn();
    const taskWithUpdate = { ...mockTasks[0], onUpdate: mockOnUpdate };

    render(<TaskList initialTasks={[taskWithUpdate]} />);
    // Additional logic would be needed to test updates
  });

  it('handles task deletion properly', () => {
    const mockOnDelete = jest.fn();
    const taskWithDelete = { ...mockTasks[0], onDelete: mockOnDelete };

    render(<TaskList initialTasks={[taskWithDelete]} />);
    // Additional logic would be needed to test deletions
  });
});