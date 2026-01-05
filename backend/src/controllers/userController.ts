// src/controllers/userController.ts
// User controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { UserModel } from '../models/User';
import { UserPreferencesModel } from '../models/UserPreferences';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the models with prisma client
const userModel = new UserModel(prisma);
const userPreferencesModel = new UserPreferencesModel(prisma);

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const user = await userModel.findUserById(userId);

    if (!user) {
      ResponseUtil.notFound(res, 'User not found');
      return;
    }

    ResponseUtil.success(res, {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences
    }, 'User profile retrieved successfully');
  } catch (error) {
    logger.error('Get user profile error:', error);
    ResponseUtil.error(res, 'Failed to retrieve user profile', error);
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { email } = req.body;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    // Check if another user already has this email
    if (email) {
      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        ResponseUtil.conflict(res, 'Email is already in use by another user');
        return;
      }
    }

    const updatedUser = await userModel.updateUser(userId, { email });

    ResponseUtil.success(res, {
      id: updatedUser.id,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    }, 'User profile updated successfully');
  } catch (error) {
    logger.error('Update user profile error:', error);
    ResponseUtil.error(res, 'Failed to update user profile', error);
  }
};

export const getUserPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const preferences = await userPreferencesModel.getUserPreferencesByUserId(userId);

    if (!preferences) {
      // If no preferences exist, create default preferences
      const defaultPreferences = await userPreferencesModel.createUserPreferences({
        user_id: userId
      });

      ResponseUtil.success(res, defaultPreferences, 'User preferences retrieved successfully');
      return;
    }

    ResponseUtil.success(res, preferences, 'User preferences retrieved successfully');
  } catch (error) {
    logger.error('Get user preferences error:', error);
    ResponseUtil.error(res, 'Failed to retrieve user preferences', error);
  }
};

export const updateUserPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { theme, timezone, language } = req.body;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const updatedPreferences = await userPreferencesModel.updateUserPreferences(userId, {
      theme,
      timezone,
      language
    });

    ResponseUtil.success(res, updatedPreferences, 'User preferences updated successfully');
  } catch (error) {
    logger.error('Update user preferences error:', error);
    ResponseUtil.error(res, 'Failed to update user preferences', error);
  }
};