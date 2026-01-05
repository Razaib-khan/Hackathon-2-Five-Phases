// src/controllers/analyticsController.ts
// Analytics controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { AnalyticsModel } from '../models/Analytics';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the analytics model with prisma client
const analyticsModel = new AnalyticsModel(prisma);

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // Assuming this is set by auth middleware

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const analytics = await analyticsModel.getDashboardAnalytics(userId);

    ResponseUtil.success(res, analytics, 'Dashboard analytics retrieved successfully');
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    ResponseUtil.error(res, 'Failed to retrieve dashboard analytics', error);
  }
};

export const getStreakData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // Assuming this is set by auth middleware

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const streakData = await analyticsModel.getStreakData(userId);

    ResponseUtil.success(res, streakData, 'Streak data retrieved successfully');
  } catch (error) {
    logger.error('Get streak data error:', error);
    ResponseUtil.error(res, 'Failed to retrieve streak data', error);
  }
};