// src/routes/userRoutes.ts
// User management routes for the AIDO task management application

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences
} from '../controllers/userController';
import { ResponseUtil } from '../utils/response';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).optional(),
});

const updateUserPreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').optional(),
  timezone: Joi.string().optional(),
  language: Joi.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/).optional(),
});

// Get user profile route (requires authentication)
router.get('/:id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to access their own profile
  if ((req as any).userId !== req.params.id) {
    return ResponseUtil.forbidden(res, 'You can only access your own profile');
  }

  getUserProfile(req, res).catch(next);
});

// Update user profile route (requires authentication)
router.put('/:id', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to update their own profile
  if ((req as any).userId !== req.params.id) {
    return ResponseUtil.forbidden(res, 'You can only update your own profile');
  }

  // Validate request body
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  updateUserProfile(req, res).catch(next);
});

// Get user preferences route (requires authentication)
router.get('/:id/preferences', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to access their own preferences
  if ((req as any).userId !== req.params.id) {
    return ResponseUtil.forbidden(res, 'You can only access your own preferences');
  }

  getUserPreferences(req, res).catch(next);
});

// Update user preferences route (requires authentication)
router.put('/:id/preferences', authenticateToken, (req, res, next) => {
  // Verify that the authenticated user is trying to update their own preferences
  if ((req as any).userId !== req.params.id) {
    return ResponseUtil.forbidden(res, 'You can only update your own preferences');
  }

  // Validate request body
  const { error } = updateUserPreferencesSchema.validate(req.body);
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  updateUserPreferences(req, res).catch(next);
});

export const userRoutes = router;