// API service for AIDO Todo Application

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem('better-auth.session_token');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.session?.accessToken || session.accessToken;
      } catch (e) {
        console.error('Error parsing session data:', e);
        return null;
      }
    }
  }
  return null;
};

// Helper function to add auth headers to requests
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API functions for authentication
export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials: LoginData): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// API functions for tasks
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  user_id: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  completed_at?: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'High' | 'Medium' | 'Low';
  completed?: boolean;
}

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch tasks');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get tasks error:', error);
    throw error;
  }
};

export const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create task');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Create task error:', error);
    throw error;
  }
};

export const getTask = async (taskId: string): Promise<Task> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch task');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Get task error:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, taskData: UpdateTaskData): Promise<Task> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update task');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Update task error:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete task');
    }
  } catch (error: any) {
    console.error('Delete task error:', error);
    throw error;
  }
};

// Forgot password function
export interface ForgotPasswordData {
  email: string;
}

export const forgotPassword = async (data: ForgotPasswordData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send password reset email');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

// Reset password function
export interface ResetPasswordData {
  token: string;
  new_password: string;
  confirm_new_password: string;
}

export const resetPassword = async (data: ResetPasswordData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to reset password');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('better-auth.session_token');
  }
};