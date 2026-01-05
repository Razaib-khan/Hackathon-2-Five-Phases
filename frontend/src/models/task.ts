// frontend/src/models/task.ts
// Task entity model for the AIDO task management application

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due_date?: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  completed_at?: string; // ISO 8601 date string
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
  priority?: 'high' | 'medium' | 'low';
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
  priority?: 'high' | 'medium' | 'low';
  due_date?: string; // ISO 8601 date string
  completed?: boolean;
  estimated_time?: number; // in minutes
  tags?: string[]; // array of tag IDs
  category?: string;
  position?: number; // for ordering tasks
  reminder_time?: string;
}

export interface TaskFilterOptions {
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  due_date?: string; // ISO 8601 date string
  tags?: string[]; // array of tag IDs
  category?: string;
  search?: string; // search term for title/description
  start_date?: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page?: number;
  limit?: number;
}