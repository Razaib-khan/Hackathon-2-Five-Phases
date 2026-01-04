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
    throw new Error(`API error: ${response.status}`)
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

export async function getTasks(userId: string, filters?: any): Promise<{ tasks: any[]; total: number }> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  const queryString = queryParams.toString()
  const endpoint = `/api/users/${userId}/tasks${queryString ? `?${queryString}` : ''}`
  return apiCall<{ tasks: any[]; total: number }>(endpoint, { method: 'GET' })
}

export async function createTask(userId: string, data?: any): Promise<any> {
  return apiCall<any>(`/api/users/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  })
}

export async function updateTask(userId: string, taskId: string, data?: any): Promise<any> {
  return apiCall<any>(`/api/users/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data || {}),
  })
}

export async function toggleTaskComplete(userId: string, taskId: string, completed?: boolean): Promise<any> {
  return apiCall<any>(`/api/users/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: completed ?? true }),
  })
}

export async function deleteTask(userId: string, taskId: string): Promise<any> {
  return apiCall<any>(`/api/users/${userId}/tasks/${taskId}`, { method: 'DELETE' })
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

export async function getTags(): Promise<{ tags: Tag[]; total: number }> {
  return apiCall<{ tags: Tag[]; total: number }>('/api/tags', { method: 'GET' })
}

export async function createTag(data: TagCreateData): Promise<Tag> {
  return apiCall<Tag>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTag(tagId: string, data: TagUpdateData): Promise<Tag> {
  return apiCall<Tag>(`/api/tags/${tagId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteTag(tagId: string): Promise<void> {
  return apiCall<void>(`/api/tags/${tagId}`, { method: 'DELETE' })
}

// ============================================================================
// Subtasks API (T071)
// ============================================================================

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface SubtaskCreateData {
  title: string
  order_index?: number
}

export interface SubtaskUpdateData {
  title?: string
  completed?: boolean
  order_index?: number
}

export async function createSubtask(
  taskId: string,
  data: SubtaskCreateData
): Promise<Subtask> {
  return apiCall<Subtask>(`/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSubtask(
  subtaskId: string,
  data: SubtaskUpdateData
): Promise<Subtask> {
  return apiCall<Subtask>(`/api/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  return apiCall<void>(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
}

// ============================================================================
// Analytics API (T072)
// ============================================================================

export interface PriorityDistribution {
  high: number
  medium: number
  low: number
  none: number
}

export interface CompletionTrendDataPoint {
  date: string
  completed: number
  created: number
}

export interface CategoryBreakdown {
  tag_name: string
  tag_color: string
  task_count: number
  completed_count: number
}

export interface DashboardAnalytics {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  due_today: number
  priority_distribution: PriorityDistribution
  completion_trend: CompletionTrendDataPoint[]
  category_breakdown: CategoryBreakdown[]
  total_time_spent: number
  average_completion_time: number
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  last_completion_date: string | null
}

export async function getDashboardAnalytics(
  period: 'week' | 'month' | 'year' | 'all' = 'all'
): Promise<DashboardAnalytics> {
  return apiCall<DashboardAnalytics>(
    `/api/analytics/dashboard?period=${period}`,
    { method: 'GET' }
  )
}

export async function getStreak(): Promise<StreakData> {
  return apiCall<StreakData>('/api/analytics/streak', { method: 'GET' })
}

// ============================================================================
// Settings API (T073)
// ============================================================================

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  default_view: 'list' | 'kanban' | 'calendar' | 'matrix'
  date_format: string
  week_start_day: number
  animations_enabled: boolean
  pomodoro_work_minutes: number
  pomodoro_break_minutes: number
  created_at: string
  updated_at: string
}

export interface UserSettingsUpdateData {
  theme?: 'light' | 'dark' | 'system'
  default_view?: 'list' | 'kanban' | 'calendar' | 'matrix'
  date_format?: string
  week_start_day?: number
  animations_enabled?: boolean
  pomodoro_work_minutes?: number
  pomodoro_break_minutes?: number
}

export async function getSettings(): Promise<UserSettings> {
  return apiCall<UserSettings>('/api/user/settings', { method: 'GET' })
}

export async function updateSettings(
  data: UserSettingsUpdateData
): Promise<UserSettings> {
  return apiCall<UserSettings>('/api/user/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ============================================================================
// Export API (T074)
// ============================================================================

export async function exportData(format: 'json' | 'csv'): Promise<Blob> {
  const response = await fetch(
    `${API_URL}/api/export?format=${format}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`)
  }

  return response.blob()
}
