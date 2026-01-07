import React, { useState } from 'react';
import TaskForm from '../components/TaskForm';
import taskService from '../services/taskService';
import './CreateTask.css';

const CreateTask = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await taskService.createTask(taskData);
      setMessage('Task created successfully!');
      setMessageType('success');
      // Reset form or redirect as needed
      setTimeout(() => {
        window.location.href = '/tasks'; // Redirect to tasks list
      }, 1500);
    } catch (error) {
      console.error('Error creating task:', error);
      setMessage(error.message || 'Failed to create task. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.history.back(); // Go back to previous page
  };

  return (
    <div className="create-task-page">
      <div className="container">
        <h1>Create New Task</h1>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateTask;