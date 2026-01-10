// API service for the Five Phase Hackathon Platform
import { Task, TaskStatus } from './types';

interface ProgressEvent extends Event {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // For endpoints that don't return JSON (like some DELETE operations)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return {} as T;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Special method for file uploads with progress tracking
  async postFile<T>(endpoint: string, data: FormData, onUploadProgress?: (progressEvent: ProgressEvent) => void): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method: 'POST',
      body: data,
      headers: {
        ...this.getHeaders(),
        // Remove Content-Type to let the browser set it with the correct boundary
        'Content-Type': undefined as any,
      },
    };

    // Create a custom fetch with progress tracking
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', url);

      // Set headers
      Object.entries(this.getHeaders()).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type') { // Don't set content-type for FormData
          xhr.setRequestHeader(key, value as string);
        }
      });

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        reject(new Error('Network error'));
      };

      if (xhr.upload && onUploadProgress) {
        xhr.upload.onprogress = function (progressEvent) {
          onUploadProgress(progressEvent);
        };
      }

      xhr.send(data);
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async register(userData: { email: string; username: string; password: string; password_confirmation: string; first_name: string; last_name: string; gdpr_consent: boolean }) {
    return this.request<{access_token: string; user: any}>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyRegistration(verificationData: { user_id: string; code: string }) {
    return this.request<{access_token: string; token_type: string; user: any}>('/api/v1/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async initiateLogin(loginData: { username_or_email: string }) {
    return this.request<{user_id: string; message: string}>('/api/v1/auth/initiate-login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async verifyLogin(verificationData: { user_id: string; code: string }) {
    return this.request<{access_token: string; token_type: string; user: any}>('/api/v1/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async login(credentials: { username: string; password: string }) {
    return this.request<{access_token: string; token_type: string; user: any}>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request<any>('/api/v1/users/me');
  }

  async updateProfile(profileData: any) {
    return this.request<any>('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{status: string; service: string}>('/api/v1/health');
  }

  // Task methods
  async getTasks() {
    return this.request<Task[]>('/api/v1/tasks');
  }

  async getTask(taskId: string) {
    return this.request<Task>(`/api/v1/tasks/${taskId}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    return this.request<Task>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, taskData: Partial<Task>) {
    return this.request<Task>(`/api/v1/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId: string) {
    return this.request<void>(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId: string) {
    return this.request<{message: string; task: Task}>(`/api/v1/tasks/${taskId}/complete`, {
      method: 'POST',
    });
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    return this.request<{message: string; task: Task}>(`/api/v1/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTaskStats() {
    return this.request<Record<string, number>>('/api/v1/tasks/stats');
  }

  async getOverdueTasks() {
    return this.request<Task[]>('/api/v1/tasks/overdue');
  }
}

export const apiService = new ApiService();