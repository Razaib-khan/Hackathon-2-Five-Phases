// src/routes/taskRoutes.ts
// Task management routes for the AIDO task management application

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} from '../controllers/taskController';
import { ResponseUtil } from '../utils/response';

const router = express.Router();

// Get user tasks route (requires authentication)
router.get('/:user_id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to access their own tasks
  if ((req as any).userId !== req.params.user_id) {
    return ResponseUtil.forbidden(res, 'You can only access your own tasks');
  }

  getUserTasks(req, res).catch(next);
});

// Create task route (requires authentication)
router.post('/:user_id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is creating tasks for themselves
  if ((req as any).userId !== req.params.user_id) {
    return ResponseUtil.forbidden(res, 'You can only create tasks for yourself');
  }

  createTask(req, res).catch(next);
});

// Get specific task route (requires authentication)
router.get('/single/:id', authenticateToken, (req, res, next) => {
  getTask(req, res).catch(next);
});

// Update task route (requires authentication)
router.put('/:id', authenticateToken, (req, res, next) => {
  updateTask(req, res).catch(next);
});

// Delete task route (requires authentication)
router.delete('/:id', authenticateToken, (req, res, next) => {
  deleteTask(req, res).catch(next);
});

// Toggle task completion route (requires authentication)
router.patch('/:id/complete', authenticateToken, (req, res, next) => {
  toggleTaskCompletion(req, res).catch(next);
});

export const taskRoutes = router;