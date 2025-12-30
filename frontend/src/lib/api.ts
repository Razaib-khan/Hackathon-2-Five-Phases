import { TaskCreateRequest, TaskUpdateRequest, TaskFilterOptions, TaskListResponse } from '@/models/task';
import { TagCreateRequest, TagUpdateRequest, TagListResponse } from '@/models/tag';
import { UserPreferences, UserPreferencesUpdateRequest } from '@/models/user-preferences';
import { UserSettings, UserSettingsUpdateData } from '@/types';

/**
 * API Client Utilities
 */

const API_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage?.getItem('authToken') || null
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (fetchOptions.headers) {
    if (typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
      Object.assign(headers, fetchOptions.headers)
    }
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => `API error: ${response.status}`);
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json()
}

export async function login(email: string, password: string) {
  const data = await apiCall<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  if (data.access_token) {
    localStorage?.setItem('authToken', data.access_token)
  }
  return data
}

export async function signup(email: string, password: string) {
  const data = await apiCall<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  if (data.access_token) {
    localStorage?.setItem('authToken', data.access_token)
  }
  return data
}

export async function register(email: string, password: string) {
  return signup(email, password)
}

export async function logout() {
  localStorage?.removeItem('authToken')
}

// Task API functions
export async function getTasks(filters?: TaskFilterOptions): Promise<TaskListResponse> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  const queryString = queryParams.toString()
  const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`
  return apiCall<TaskListResponse>(endpoint, { method: 'GET' })
}

export async function createTask(data: TaskCreateRequest): Promise<any> {
  return apiCall<any>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTask(taskId: string, data: TaskUpdateRequest): Promise<any> {
  return apiCall<any>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function toggleTaskComplete(taskId: string, completed?: boolean): Promise<any> {
  return apiCall<any>(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: completed ? 'done' : 'todo' }),
  })
}

export async function deleteTask(taskId: string): Promise<any> {
  return apiCall<any>(`/api/tasks/${taskId}`, { method: 'DELETE' })
}

// Subtask API functions
export async function createSubtask(taskId: string, data: any): Promise<any> {
  return apiCall<any>(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSubtask(subtaskId: string, data: any): Promise<any> {
  return apiCall<any>(`/api/subtasks/${subtaskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteSubtask(subtaskId: string): Promise<any> {
  return apiCall<any>(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
}

// Tag API functions
export async function getTags(filters?: any): Promise<TagListResponse> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  const queryString = queryParams.toString()
  const endpoint = `/api/tags${queryString ? `?${queryString}` : ''}`
  return apiCall<TagListResponse>(endpoint, { method: 'GET' })
}

export async function createTag(data: TagCreateRequest): Promise<any> {
  return apiCall<any>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTag(tagId: string, data: TagUpdateRequest): Promise<any> {
  return apiCall<any>(`/api/tags/${tagId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteTag(tagId: string): Promise<void> {
  return apiCall<void>(`/api/tags/${tagId}`, { method: 'DELETE' })
}

// Export API functions
export async function exportTasks(format: 'json' | 'csv', params?: { include_completed?: boolean; start_date?: string; end_date?: string }): Promise<any> {
  const url = new URL('/api/export', `${API_URL}`);
  url.searchParams.append('format', format);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return apiCall<any>(url.pathname + url.search, { method: 'GET' });
}

// Analytics API functions
export async function getDashboardAnalytics(period?: 'week' | 'month' | 'year' | 'all'): Promise<any> {
  const url = new URL('/api/analytics/dashboard', `${API_URL}`);
  if (period) {
    url.searchParams.append('period', period);
  }

  return apiCall<any>(url.pathname + url.search, { method: 'GET' });
}

export async function getStreakData(): Promise<any> {
  return apiCall<any>('/api/analytics/streak', { method: 'GET' });
}

// User Preferences API functions
export async function getUserPreferences(): Promise<UserPreferences> {
  return apiCall<UserPreferences>('/api/user/preferences', { method: 'GET' });
}

export async function updateUserPreferences(preferences: UserPreferencesUpdateRequest): Promise<UserPreferences> {
  return apiCall<UserPreferences>('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences)
  });
}

// User Settings API functions
export async function getUserSettings(): Promise<UserSettings> {
  return apiCall<UserSettings>('/api/user/settings', { method: 'GET' });
}

export async function updateUserSettings(data: UserSettingsUpdateData): Promise<UserSettings> {
  return apiCall<UserSettings>('/api/user/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// Settings API functions (aliases for useSettings hook)
export async function getSettings(): Promise<UserSettings> {
  return getUserSettings();
}

export async function updateSettings(data: UserSettingsUpdateData): Promise<UserSettings> {
  return apiCall<UserSettings>('/api/user/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function checkHealth() {
  try {
    return await apiCall('/health', { skipAuth: true })
  } catch {
    return { status: 'offline', database: 'disconnected' }
  }
}

// Analytics types
export interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
  none: number;
}

export interface CategoryBreakdownEntry {
  tag_name: string;
  tag_color: string;
  task_count: number;
  completed_count: number;
}

export interface DashboardAnalytics {
  total_users: number;
  total_tasks: number;
  tasks_completed_today: number;
  active_projects: number;
  my_tasks: number;
  tasks_assigned_to_me: number;
  my_projects: number;
  overdue_tasks: number;
  completed_tasks: number;
  due_today: number;
  completion_trend: any[];
  priority_distribution: PriorityDistribution;
  category_breakdown: CategoryBreakdownEntry[];
  total_time_spent: number;
  average_completion_time: number;
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

export interface SubtaskCreateData {
  title: string;
  order_index?: number;
}

export interface SubtaskUpdateData {
  title?: string;
  completed?: boolean;
  order_index?: number;
}


// Tag types - extending from models
export interface TagCreateData extends TagCreateRequest {}
export interface TagUpdateData extends TagUpdateRequest {}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_break_date?: string;
}

// Settings types
export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  task_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdateData {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  task_reminders?: boolean;
}

export async function getStoredUser() {
  const token = getToken()
  if (!token) return null
  try {
    // Decode JWT to get user info
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.sub || decoded.user_id || null
  } catch {
    return null
  }
}

export { getToken }