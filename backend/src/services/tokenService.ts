// src/services/tokenService.ts
// Token management service for the AIDO task management application

import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenResult {
  success: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
  error?: string;
}

export class TokenService {
  /**
   * Generate a new pair of access and refresh tokens
   */
  static generateTokenPair(userId: string, email: string): TokenPair {
    const accessToken = generateAccessToken(userId, email);
    const refreshToken = generateRefreshToken(userId, email);

    return {
      access_token: accessToken,
      refresh_token: refreshToken
    };
  }

  /**
   * Refresh an access token using a refresh token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }

    // Check if the user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, is_active: true }
    });

    if (!user || !user.is_active) {
      return {
        success: false,
        error: 'User does not exist or is inactive'
      };
    }

    // Generate new tokens
    const newTokens = this.generateTokenPair(user.id, user.email);

    return {
      success: true,
      newAccessToken: newTokens.access_token,
      newRefreshToken: newTokens.refresh_token
    };
  }

  /**
   * Invalidate a refresh token (logout functionality)
   */
  static async invalidateRefreshToken(refreshToken: string): Promise<boolean> {
    // In a real implementation, you might want to store refresh tokens in a database
    // to allow for explicit invalidation. For now, we'll just return true.
    // In a production system, you would typically maintain a "refresh token blacklist"
    // or use a separate database table to track valid/invalid tokens.

    // This is a simplified implementation
    return true;
  }

  /**
   * Validate if a token is still valid
   */
  static validateToken(token: string): boolean {
    try {
      // Try to verify the token
      verifyRefreshToken(token);
      // If we get here without an exception, the token is valid
      return true;
    } catch (error) {
      return false;
    }
  }
}