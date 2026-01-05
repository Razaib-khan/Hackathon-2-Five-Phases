// src/controllers/healthController.ts
// Health check controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { prisma } from '../config/database';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Additional health checks can be added here
    // For example: cache connectivity, external service availability, etc.

    ResponseUtil.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected'
      }
    }, 'Health check passed');
  } catch (error) {
    ResponseUtil.error(res, 'Health check failed', error);
  }
};