/**
 * API Client for AIDO Frontend
 *
 * Centralized API functions for interacting with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Generic API request helper
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API request failed: ${response.status}`);
  }

  return response.json();
};

// Task API functions
export const getTasks = async (userId: string, filters: any = {}) => {
  const params = new URLSearchParams({
    page: filters.page?.toString() || '1',
    page_size: filters.page_size?.toString() || '20',
    sort_by: filters.sort_by || 'created_at',
    sort_order: filters.sort_order || 'desc',
    ...(filters.search && { search: filters.search }),
    ...(typeof filters.completed === 'boolean' && { completed: filters.completed.toString() }),
  });

  return apiRequest(`/api/users/${userId}/tasks?${params}`);
};

export const createTask = async (userId: string, data: any) => {
  return apiRequest(`/api/users/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateTask = async (userId: string, taskId: string, data: any) => {
  return apiRequest(`/api/users/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const toggleTaskComplete = async (userId: string, taskId: string) => {
  return apiRequest(`/api/users/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  });
};

export const deleteTask = async (userId: string, taskId: string) => {
  return apiRequest(`/api/users/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
};