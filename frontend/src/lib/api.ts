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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
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
  if (data.token) {
    localStorage?.setItem('authToken', data.token)
  }
  return data
}

export async function signup(email: string, password: string) {
  const data = await apiCall<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  if (data.token) {
    localStorage?.setItem('authToken', data.token)
  }
  return data
}

export async function register(email: string, password: string) {
  return signup(email, password)
}

export async function logout() {
  localStorage?.removeItem('authToken')
}

export async function getTasks() {
  return apiCall('/tasks', { method: 'GET' })
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

export async function toggleTaskComplete(id: string, completed: boolean) {
  return updateTask(id, { completed })
}

export async function deleteTask(id: string) {
  return apiCall(`/tasks/${id}`, { method: 'DELETE' })
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
