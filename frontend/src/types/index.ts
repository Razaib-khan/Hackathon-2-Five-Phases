/**
 * Type Definitions for AIDO Frontend
 *
 * Mirrors backend schemas for type safety
 */

// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Task types
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
  completed?: boolean; // Track completion separately from status
  time_spent?: number; // Track time spent on task
  custom_order?: number; // Custom ordering property
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

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
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

// API Error
export interface ApiError {
  detail: string;
}

// Auth forms
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Task filters
export interface TaskFilters {
  completed?: boolean;
  status?: 'todo' | 'in_progress' | 'done' | 'blocked';
  search?: string;
  sort_by?: 'created_at' | 'title' | 'status' | 'completed';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
