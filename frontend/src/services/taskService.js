/**
 * Task Service - Frontend API Client
 *
 * Service for interacting with the backend task API endpoints.
 */

class TaskService {
  constructor(apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/v1') {
    this.apiBaseUrl = apiBaseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authorization headers with token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Create a new task
   * Only requires title and priority as per spec
   */
  async createTask(taskData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          title: taskData.title,
          priority: taskData.priority || 'medium', // Default to medium if not provided
          description: taskData.description || '',
          assigned_to: taskData.assignedTo || null,
          project_id: taskData.projectId || null,
          due_date: taskData.dueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get user's tasks
   */
  async getUserTasks() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId, taskData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating task ${taskId} status:`, error);
      throw error;
    }
  }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService;