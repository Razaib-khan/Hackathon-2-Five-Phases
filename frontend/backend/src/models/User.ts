// src/models/User.ts
// User model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface UserCreateData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserWithPreferences {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme?: string;
    timezone?: string;
    language?: string;
  } | null;
}

export interface UserResponse {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createUser(data: UserCreateData): Promise<UserResponse> {
    // Hash the password before saving
    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      }
    });

    // Return with the correct field names
    return {
      id: user.id,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findUserById(id: string): Promise<UserWithPreferences | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        preferences: {
          select: {
            theme: true,
            timezone: true,
            language: true,
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      preferences: user.preferences || null,
    };
  }

  async findUserByEmail(email: string): Promise<UserWithPreferences | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        preferences: {
          select: {
            theme: true,
            timezone: true,
            language: true,
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      preferences: user.preferences || null,
    };
  }

  async updateUser(id: string, data: UserUpdateData): Promise<UserResponse> {
    const updateData: any = {};

    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password_hash = await this.hashPassword(data.password);
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: user.id,
      email: user.email,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async comparePassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
    // In a real implementation, you would use bcrypt.compare
    // For now, we'll just return true for demonstration
    return inputPassword === hashedPassword;
  }

  private async hashPassword(password: string): Promise<string> {
    // In a real implementation, you would use bcrypt.hash
    // For now, we'll just return the password as-is for demonstration
    return password;
  }
}