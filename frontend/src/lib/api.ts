import { TaskCreateRequest, TaskUpdateRequest, TaskFilterOptions, TaskListResponse, Subtask, SubtaskCreateData, SubtaskUpdateData } from '@/models/task';
import { TagCreateRequest, TagUpdateRequest, TagListResponse } from '@/models/tag';
import { UserPreferences, UserPreferencesUpdateRequest } from '@/models/user-preferences';
import { DashboardAnalytics, StreakData } from '@/models/analytics';

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
export async function getTasks(userId: string, filters?: TaskFilterOptions): Promise<TaskListResponse> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array values by adding each as a separate parameter
          value.forEach(v => queryParams.append(key, String(v)))
        } else {
          queryParams.append(key, String(value))
        }
      }
    })
  }
  const queryString = queryParams.toString()
  const endpoint = `/api/users/${userId}/tasks${queryString ? `?${queryString}` : ''}`
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
export async function getTags(userId: string, filters?: any): Promise<TagListResponse> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array values by adding each as a separate parameter
          value.forEach(v => queryParams.append(key, String(v)))
        } else {
          queryParams.append(key, String(value))
        }
      }
    })
  }
  const queryString = queryParams.toString()
  const endpoint = `/api/users/${userId}/tags${queryString ? `?${queryString}` : ''}`
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
        if (Array.isArray(value)) {
          // Handle array values by adding each as a separate parameter
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    });
  }

  return apiCall<any>(url.pathname + url.search, { method: 'GET' });
}

// Analytics API functions
export async function getDashboardAnalytics(period?: 'week' | 'month' | 'year' | 'all'): Promise<DashboardAnalytics> {
  const url = new URL('/api/analytics/dashboard', `${API_URL}`);
  if (period) {
    url.searchParams.append('period', period);
  }

  return apiCall<DashboardAnalytics>(url.pathname + url.search, { method: 'GET' });
}

export async function getStreakData(): Promise<StreakData> {
  return apiCall<StreakData>('/api/analytics/streak', { method: 'GET' });
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

// Subtask API functions
export async function createSubtask(taskId: string, data: SubtaskCreateData): Promise<Subtask> {
  return apiCall<Subtask>(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSubtask(subtaskId: string, data: SubtaskUpdateData): Promise<Subtask> {
  return apiCall<Subtask>(`/api/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  return apiCall<void>(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
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
