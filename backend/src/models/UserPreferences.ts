// src/models/UserPreferences.ts
// User Preferences model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface UserPreferencesCreateData {
  user_id: string;
  theme?: string;
  timezone?: string;
  language?: string;
}

export interface UserPreferencesUpdateData {
  theme?: string;
  timezone?: string;
  language?: string;
}

export interface UserPreferencesResponse {
  id: string;
  user_id: string;
  theme: string;
  timezone: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

export class UserPreferencesModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createUserPreferences(data: UserPreferencesCreateData): Promise<UserPreferencesResponse> {
    // Validate input values
    this.validatePreferences(data);

    const preferences = await this.prisma.userPreferences.create({
      data: {
        user_id: data.user_id,
        theme: data.theme || 'light',
        timezone: data.timezone || 'UTC',
        language: data.language || 'en',
      },
      select: {
        id: true,
        user_id: true,
        theme: true,
        timezone: true,
        language: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: preferences.id,
      user_id: preferences.user_id,
      theme: preferences.theme,
      timezone: preferences.timezone,
      language: preferences.language,
      created_at: preferences.created_at,
      updated_at: preferences.updated_at,
    };
  }

  async getUserPreferencesByUserId(userId: string): Promise<UserPreferencesResponse | null> {
    const preferences = await this.prisma.userPreferences.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        user_id: true,
        theme: true,
        timezone: true,
        language: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!preferences) return null;

    return {
      id: preferences.id,
      user_id: preferences.user_id,
      theme: preferences.theme,
      timezone: preferences.timezone,
      language: preferences.language,
      created_at: preferences.created_at,
      updated_at: preferences.updated_at,
    };
  }

  async updateUserPreferences(userId: string, data: UserPreferencesUpdateData): Promise<UserPreferencesResponse> {
    // Validate input values
    this.validatePreferences(data);

    const updateData: any = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.language !== undefined) updateData.language = data.language;

    const preferences = await this.prisma.userPreferences.upsert({
      where: { user_id: userId },
      update: updateData,
      create: {
        user_id: userId,
        theme: data.theme || 'light',
        timezone: data.timezone || 'UTC',
        language: data.language || 'en',
      },
      select: {
        id: true,
        user_id: true,
        theme: true,
        timezone: true,
        language: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: preferences.id,
      user_id: preferences.user_id,
      theme: preferences.theme,
      timezone: preferences.timezone,
      language: preferences.language,
      created_at: preferences.created_at,
      updated_at: preferences.updated_at,
    };
  }

  async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      await this.prisma.userPreferences.delete({
        where: { user_id: userId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      return false;
    }
  }

  private validatePreferences(data: Partial<UserPreferencesCreateData | UserPreferencesUpdateData>): void {
    // Validate theme
    if (data.theme && !['light', 'dark', 'system'].includes(data.theme)) {
      throw new Error('Invalid theme. Must be one of: light, dark, system');
    }

    // Validate language
    if (data.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(data.language)) {
      throw new Error('Invalid language format. Use format like: en, en-US, fr, etc.');
    }

    // Validate timezone
    if (data.timezone && !this.isValidTimezone(data.timezone)) {
      throw new Error('Invalid timezone. Please provide a valid IANA timezone (e.g., UTC, America/New_York)');
    }
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      // Check if the timezone is valid by creating a date with it
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (e) {
      return false;
    }
  }
}