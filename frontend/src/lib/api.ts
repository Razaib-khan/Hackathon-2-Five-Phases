import { TaskCreateRequest, TaskUpdateRequest, TaskFilterOptions, TaskListResponse } from '@/models/task';
import { TagCreateRequest, TagUpdateRequest, TagListResponse } from '@/models/tag';
import { UserPreferences, UserPreferencesUpdateRequest } from '@/models/user-preferences';

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
  const data = await apiCall<any>('/login', {  // Changed to use simpler endpoint
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
  // Generate username from email since the auth-context calls this with just email/password
  // Sanitize username to comply with validation rules: only letters, numbers, underscores, hyphens
  let username = email.split('@')[0];
  // Replace any invalid characters with underscores
  username = username.replace(/[^a-zA-Z0-9_-]/g, '_');
  // Ensure it meets length requirements (3-50 chars)
  if (username.length < 3) {
    username = username + '___'.substring(0, 3 - username.length);  // Pad if too short
  } else if (username.length > 50) {
    username = username.substring(0, 50);  // Truncate if too long
  }

  const data = await apiCall<any>('/auth/register', {  // Use the endpoint that expects full user data
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      first_name: '',
      last_name: ''
    }),
    skipAuth: true,
  })
  if (data.access_token) {
    localStorage?.setItem('authToken', data.access_token)
  }
  return data
}

export async function signupWithDetails(username: string, email: string, password: string, firstName: string = '', lastName: string = '') {
  const data = await apiCall<any>('/auth/register', {  // Use the endpoint that expects full user data
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName
    }),
    skipAuth: true,
  })
  if (data.access_token) {
    localStorage?.setItem('authToken', data.access_token)
  }
  return data
}

export async function register(email: string, password: string) {
  // Use the signup function which generates username from email
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
  return apiCall<any>(`/api/tasks/${taskId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: completed ?? true }),
  })
}

export async function deleteTask(taskId: string): Promise<any> {
  return apiCall<any>(`/api/tasks/${taskId}`, { method: 'DELETE' })
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
export async function getUserSettings(): Promise<any> {
  return apiCall<any>('/api/user/settings', { method: 'GET' });
}

export async function updateUserSettings(data: any): Promise<any> {
  return apiCall<any>('/api/user/settings', {
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


// ============================================================================
// Tags API (T070)
// ============================================================================

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface TagCreateData {
  name: string
  color?: string
}

export interface TagUpdateData {
  name?: string
  color?: string
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

// Streak API function
export async function getStreak() {
  return apiCall('/api/analytics/streak', { method: 'GET' })
}



