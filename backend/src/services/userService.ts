// src/services/userService.ts
// User service for the AIDO task management application

import { prisma } from '../config/database';
import { UserModel } from '../models/User';
import { UserCreateData, UserUpdateData, UserLoginData, UserResponse } from '../models/User';

// Initialize the user model with prisma client
const userModel = new UserModel(prisma);

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: UserCreateData): Promise<UserResponse> {
    return await userModel.createUser(userData);
  }

  /**
   * Find a user by ID
   */
  static async findUserById(id: string): Promise<UserResponse | null> {
    const user = await userModel.findUserById(id);
    if (!user) return null;

    // Return the response format
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Find a user by email
   */
  static async findUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await userModel.findUserByEmail(email);
    if (!user) return null;

    // Return the response format
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update a user
   */
  static async updateUser(id: string, updateData: UserUpdateData): Promise<UserResponse> {
    return await userModel.updateUser(id, updateData);
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<boolean> {
    return await userModel.deleteUser(id);
  }

  /**
   * Validate user credentials for login
   */
  static async validateUserCredentials(loginData: UserLoginData): Promise<UserResponse | null> {
    const user = await this.findUserByEmail(loginData.email);

    if (!user) {
      return null;
    }

    // Compare the provided password with the stored hash
    // In a real implementation, use bcrypt.compare
    const isValid = await userModel.comparePassword(loginData.password, user.id);

    if (isValid) {
      return user;
    }

    return null;
  }

  /**
   * Check if a user exists by email
   */
  static async userExists(email: string): Promise<boolean> {
    const user = await this.findUserByEmail(email);
    return user !== null;
  }

  /**
   * Update user password
   */
  static async updateUserPassword(userId: string, newPassword: string): Promise<UserResponse> {
    return await this.updateUser(userId, { password: newPassword });
  }

  /**
   * Activate a user account
   */
  static async activateUser(userId: string): Promise<UserResponse> {
    return await this.updateUser(userId, { isActive: true });
  }

  /**
   * Deactivate a user account
   */
  static async deactivateUser(userId: string): Promise<UserResponse> {
    return await this.updateUser(userId, { isActive: false });
  }
}