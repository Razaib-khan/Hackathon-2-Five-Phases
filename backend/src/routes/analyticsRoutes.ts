// src/routes/analyticsRoutes.ts
// Analytics routes for the AIDO task management application

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getDashboardAnalytics,
  getStreakData
} from '../controllers/analyticsController';
import { ResponseUtil } from '../utils/response';

const router = express.Router();

// Get dashboard analytics route (requires authentication)
router.get('/dashboard', authenticateToken, (req, res, next) => {
  getDashboardAnalytics(req, res).catch(next);
});

// Get streak data route (requires authentication)
router.get('/streak', authenticateToken, (req, res, next) => {
  getStreakData(req, res).catch(next);
});

export const analyticsRoutes = router;