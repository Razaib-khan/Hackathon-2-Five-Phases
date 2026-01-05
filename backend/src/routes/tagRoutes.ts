// src/routes/tagRoutes.ts
// Tag management routes for the AIDO task management application

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserTags,
  createTag,
  updateTag,
  deleteTag,
  assignTagToTask,
  removeTagFromTask
} from '../controllers/tagController';
import {
  validateTagCreation,
  validateTagUpdate
} from '../validators/tagValidator';
import { ResponseUtil } from '../utils/response';

const router = express.Router();

// Get user tags route (requires authentication)
router.get('/:user_id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to access their own tags
  if ((req as any).userId !== req.params.user_id) {
    return ResponseUtil.forbidden(res, 'You can only access your own tags');
  }

  getUserTags(req, res).catch(next);
});

// Create tag route (requires authentication)
router.post('/:user_id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is creating tags for themselves
  if ((req as any).userId !== req.params.user_id) {
    return ResponseUtil.forbidden(res, 'You can only create tags for yourself');
  }

  // Validate request body
  const { error } = validateTagCreation(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  createTag(req, res).catch(next);
});

// Update tag route (requires authentication)
router.put('/:id', authenticateToken, (req, res, next) => {
  // Validate request body
  const { error } = validateTagUpdate(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  updateTag(req, res).catch(next);
});

// Delete tag route (requires authentication)
router.delete('/:id', authenticateToken, (req, res, next) => {
  deleteTag(req, res).catch(next);
});

// Assign tag to task route (requires authentication)
router.post('/:tag_id/tasks/:task_id', authenticateToken, (req, res, next) => {
  assignTagToTask(req, res).catch(next);
});

// Remove tag from task route (requires authentication)
router.delete('/:tag_id/tasks/:task_id', authenticateToken, (req, res, next) => {
  removeTagFromTask(req, res).catch(next);
});

export const tagRoutes = router;