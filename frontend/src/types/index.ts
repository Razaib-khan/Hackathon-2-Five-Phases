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
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  estimated_time?: number;
  tags?: string[];
  subtasks?: Subtask[];
  category?: string;
  position?: number;
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
  page?: number;
  limit?: number;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  completed?: boolean;
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
  search?: string;
  sort_by?: 'created_at' | 'title' | 'completed';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
