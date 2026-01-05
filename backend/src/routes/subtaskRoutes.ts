// src/routes/subtaskRoutes.ts
// Subtask management routes for the AIDO task management application

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtaskCompletion
} from '../controllers/subtaskController';
import {
  validateSubtaskCreation,
  validateSubtaskUpdate
} from '../validators/subtaskValidator';
import { ResponseUtil } from '../utils/response';

const router = express.Router();

// Create subtask route (requires authentication)
router.post('/:task_id', authenticateToken, (req, res, next) => {
  // Validate request body
  const { error } = validateSubtaskCreation(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  createSubtask(req, res).catch(next);
});

// Update subtask route (requires authentication)
router.patch('/:id', authenticateToken, (req, res, next) => {
  // Validate request body
  const { error } = validateSubtaskUpdate(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  updateSubtask(req, res).catch(next);
});

// Delete subtask route (requires authentication)
router.delete('/:id', authenticateToken, (req, res, next) => {
  deleteSubtask(req, res).catch(next);
});

// Toggle subtask completion route (requires authentication)
router.patch('/:id/complete', authenticateToken, (req, res, next) => {
  toggleSubtaskCompletion(req, res).catch(next);
});

export const subtaskRoutes = router;