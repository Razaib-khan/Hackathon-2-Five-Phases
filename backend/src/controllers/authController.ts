// src/controllers/authController.ts
// Authentication controller for the AIDO task management application

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ResponseUtil } from '../utils/response';
import { UserModel } from '../models/User';
import { TokenService } from '../services/tokenService';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the user model with prisma client
const userModel = new UserModel(prisma);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      ResponseUtil.badRequest(res, 'Email and password are required');
      return;
    }

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      ResponseUtil.conflict(res, 'User with this email already exists');
      return;
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      ResponseUtil.badRequest(res, 'Password must be at least 6 characters long');
      return;
    }

    // Create new user
    const newUser = await userModel.createUser({ email, password });

    // Generate tokens
    const tokens = TokenService.generateTokenPair(newUser.id, newUser.email);

    // Return success response with tokens
    ResponseUtil.success(res, {
      user: newUser,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    }, 'User registered successfully', 201);
  } catch (error) {
    logger.error('Registration error:', error);
    ResponseUtil.error(res, 'Registration failed', error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      ResponseUtil.badRequest(res, 'Email and password are required');
      return;
    }

    // Find user by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      ResponseUtil.unauthorized(res, 'Invalid email or password');
      return;
    }

    // Compare passwords (in a real implementation, use bcrypt.compare)
    // For now, we'll use a simple comparison but in a real app, we'd hash the password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      ResponseUtil.unauthorized(res, 'Invalid email or password');
      return;
    }

    // Generate tokens
    const tokens = TokenService.generateTokenPair(user.id, user.email);

    // Return success response with tokens
    ResponseUtil.success(res, {
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        preferences: user.preferences
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    ResponseUtil.error(res, 'Login failed', error);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      ResponseUtil.badRequest(res, 'Refresh token is required');
      return;
    }

    // Use the token service to refresh the token
    const result = await TokenService.refreshToken(refresh_token);

    if (result.success) {
      ResponseUtil.success(res, {
        access_token: result.newAccessToken,
        refresh_token: result.newRefreshToken
      }, 'Token refreshed successfully');
    } else {
      ResponseUtil.unauthorized(res, result.error || 'Invalid refresh token');
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    ResponseUtil.error(res, 'Token refresh failed', error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you might want to add the refresh token to a blacklist
    // to prevent it from being used again. For now, we just return a success message.
    const { refresh_token } = req.body;

    if (refresh_token) {
      // Invalidate the refresh token
      await TokenService.invalidateRefreshToken(refresh_token);
    }

    ResponseUtil.success(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    ResponseUtil.error(res, 'Logout failed', error);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would be called after authentication middleware
    // The userId should be attached to the request by the middleware
    const userId = (req as any).userId;

    if (!userId) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
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
    logger.error('Get profile error:', error);
    ResponseUtil.error(res, 'Failed to retrieve user profile', error);
  }
};