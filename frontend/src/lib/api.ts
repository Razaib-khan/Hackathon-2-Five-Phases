/**
 * API Client Utilities
 *
 * Provides utilities for making API requests to the backend.
 * Currently stubbed for static export. Will be fully implemented in Phase 3.
 */

const API_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  // Add auth token if not skipped
  if (!skipAuth) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Auth endpoints (Phase 3)
export async function login(email: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
}

export async function signup(email: string, password: string) {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
}

// Task endpoints (Phase 2+)
export async function getTasks() {
  return apiCall('/tasks', {
    method: 'GET',
  })
}

export async function createTask(title: string, description?: string) {
  return apiCall('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export async function updateTask(id: string, data: Record<string, unknown>) {
  return apiCall(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteTask(id: string) {
  return apiCall(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

// Health check
export async function checkHealth() {
  try {
    return await apiCall('/health', {
      skipAuth: true,
    })
  } catch (error) {
    return { status: 'offline', database: 'disconnected' }
  }
}
