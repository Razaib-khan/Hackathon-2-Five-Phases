// src/routes/authRoutes.ts
// Authentication routes for the AIDO task management application

import express from 'express';
import { register, login, refreshToken, logout, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  validateUserRegistration,
  validateUserLogin,
  validateRefreshToken
} from '../validators/userValidator';
import { ResponseUtil } from '../utils/response';

const router = express.Router();

// Register route
router.post('/register', (req, res, next) => {
  // Validate request body
  const { error } = validateUserRegistration(req.body);
  if (error) {
    // Extract error details
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  // If validation passes, proceed to controller
  register(req, res).catch(next);
});

// Login route
router.post('/login', (req, res, next) => {
  // Validate request body
  const { error } = validateUserLogin(req.body);
  if (error) {
    // Extract error details
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  // If validation passes, proceed to controller
  login(req, res).catch(next);
});

// Refresh token route
router.post('/refresh', (req, res, next) => {
  // Validate request body
  const { error } = validateRefreshToken(req.body);
  if (error) {
    // Extract error details
    const errors = error.details.map(detail => detail.message);
    return ResponseUtil.validationError(res, errors);
  }

  // If validation passes, proceed to controller
  refreshToken(req, res).catch(next);
});

// Logout route
router.post('/logout', (req, res, next) => {
  logout(req, res).catch(next);
});

// Get profile route (requires authentication)
router.get('/profile', authenticateToken, (req, res, next) => {
  getProfile(req, res).catch(next);
});

export const authRoutes = router;