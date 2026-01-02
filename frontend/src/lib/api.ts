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
