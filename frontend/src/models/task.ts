// frontend/src/models/task.ts
// Task entity model for the AIDO task management application

export interface Task {
  id: number; // Backend uses integer IDs, not strings
  created_by: number; // Backend uses 'created_by', not 'user_id'
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent'; // Backend has 4 priority levels
  status: 'todo' | 'in_progress' | 'done' | 'blocked'; // Backend uses status enum, not completed boolean
  assigned_to?: number;
  project_id?: number;
  due_date?: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  // Remove completed field - use status instead
  estimated_time?: number; // in minutes
  tags?: string[]; // array of tag IDs
  subtasks?: Subtask[];
  category?: string;
  position?: number; // for ordering tasks
  reminder_time?: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Backend has 4 priority levels
  status?: 'todo' | 'in_progress' | 'done' | 'blocked'; // Backend uses status enum
  assigned_to?: number;
  project_id?: number;
  due_date?: string; // ISO 8601 date string
  estimated_time?: number; // in minutes
  tags?: string[]; // array of tag IDs
  category?: string;
  position?: number; // for ordering tasks
  reminder_time?: string;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent'; // Backend has 4 priority levels
  status?: 'todo' | 'in_progress' | 'done' | 'blocked'; // Backend uses status enum
  assigned_to?: number;
  project_id?: number;
  due_date?: string; // ISO 8601 date string
  estimated_time?: number; // in minutes
  tags?: string[]; // array of tag IDs
  category?: string;
  position?: number; // for ordering tasks
  reminder_time?: string;
}

export interface TaskFilterOptions {
  skip?: number;
  limit?: number;
  // Update filters to match backend expectations
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  due_date?: string; // ISO 8601 date string
  tags?: string[]; // array of tag IDs
  category?: string;
  search?: string; // search term for title/description
  start_date?: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string
}

export interface TaskListResponse {
  tasks: Task[]; // Update to match actual backend response
  total?: number;
  page?: number;
  limit?: number;
}