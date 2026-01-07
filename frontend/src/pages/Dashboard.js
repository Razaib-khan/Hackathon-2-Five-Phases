import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard statistics from the backend
      const statsResponse = await fetch('/v1/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const statsData = await statsResponse.json();

      // Fetch dashboard tasks
      const tasksResponse = await fetch('/v1/dashboard/tasks', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch dashboard tasks');
      }

      const tasksData = await tasksResponse.json();

      setDashboardData({
        stats: statsData.data,
        tasks: tasksData.data,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>Dashboard</h1>
          <div className="loading">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>Dashboard</h1>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  const { stats, tasks } = dashboardData;

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Dashboard</h1>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{stats.my_tasks || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Tasks Assigned to Me</h3>
            <p>{stats.tasks_assigned_to_me || 0}</p>
          </div>
          <div className="stat-card">
            <h3>My Projects</h3>
            <p>{stats.my_projects || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Tasks Completed Today</h3>
            <p>{stats.tasks_completed_today || 0}</p>
          </div>
        </div>

        {/* Task Overview */}
        <div className="dashboard-section">
          <h2>My Tasks</h2>
          {tasks.my_tasks && tasks.my_tasks.length > 0 ? (
            <div className="task-list">
              {tasks.my_tasks.map(task => (
                <div key={task.id} className="task-item">
                  <h4>{task.title}</h4>
                  <p>Status: {task.status}</p>
                  <p>Priority: {task.priority}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks assigned to you.</p>
          )}
        </div>

        {/* Tasks Assigned to Me */}
        <div className="dashboard-section">
          <h2>Tasks Assigned to Me</h2>
          {tasks.tasks_assigned_to_me && tasks.tasks_assigned_to_me.length > 0 ? (
            <div className="task-list">
              {tasks.tasks_assigned_to_me.map(task => (
                <div key={task.id} className="task-item">
                  <h4>{task.title}</h4>
                  <p>Status: {task.status}</p>
                  <p>Priority: {task.priority}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks assigned to you.</p>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="dashboard-section">
          <h2>Overdue Tasks</h2>
          {tasks.overdue_tasks && tasks.overdue_tasks.length > 0 ? (
            <div className="task-list">
              {tasks.overdue_tasks.map(task => (
                <div key={task.id} className="task-item overdue">
                  <h4>{task.title}</h4>
                  <p>Status: {task.status}</p>
                  <p>Due: {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No overdue tasks.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;