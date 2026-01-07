/**
 * Dashboard Service - Frontend API Client
 *
 * Service for interacting with the backend dashboard API endpoints.
 */

class DashboardService {
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
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get dashboard tasks overview
   */
  async getDashboardTasks() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/dashboard/tasks`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard tasks: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard tasks:', error);
      throw error;
    }
  }

  /**
   * Get dashboard projects overview
   */
  async getDashboardProjects() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/dashboard/projects`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard projects: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard projects:', error);
      throw error;
    }
  }

  /**
   * Get user activity statistics
   */
  async getUserActivityStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/dashboard/activity`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user activity stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
const dashboardService = new DashboardService();
export default dashboardService;