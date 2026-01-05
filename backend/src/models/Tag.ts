// src/models/Tag.ts
// Tag model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface TagCreateData {
  user_id: string;
  name: string;
  color: string; // hex color
}

export interface TagUpdateData {
  name?: string;
  color?: string; // hex color
}

export interface TagResponse {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface TagListResponse {
  tags: TagResponse[];
  total: number;
}

export class TagModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createTag(data: TagCreateData): Promise<TagResponse> {
    // Validate color format (should be hex)
    if (!this.isValidHexColor(data.color)) {
      throw new Error('Invalid color format. Must be a valid hex color (e.g., #FF0000)');
    }

    const tag = await this.prisma.tag.create({
      data: {
        user_id: data.user_id,
        name: data.name,
        color: data.color,
      },
      select: {
        id: true,
        user_id: true,
        name: true,
        color: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      color: tag.color,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
    };
  }

  async getTagById(id: string): Promise<TagResponse | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        name: true,
        color: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!tag) return null;

    return {
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      color: tag.color,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
    };
  }

  async getTagsByUserId(userId: string): Promise<TagListResponse> {
    const tags = await this.prisma.tag.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        user_id: true,
        name: true,
        color: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedTags = tags.map(tag => ({
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      color: tag.color,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
    }));

    return {
      tags: formattedTags,
      total: formattedTags.length,
    };
  }

  async updateTag(id: string, data: TagUpdateData): Promise<TagResponse> {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) {
      if (!this.isValidHexColor(data.color)) {
        throw new Error('Invalid color format. Must be a valid hex color (e.g., #FF0000)');
      }
      updateData.color = data.color;
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        user_id: true,
        name: true,
        color: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: tag.id,
      user_id: tag.user_id,
      name: tag.name,
      color: tag.color,
      created_at: tag.created_at,
      updated_at: tag.updated_at,
    };
  }

  async deleteTag(id: string): Promise<boolean> {
    try {
      await this.prisma.tag.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }

  async assignTagToTask(tagId: string, taskId: string): Promise<boolean> {
    try {
      await this.prisma.taskTag.create({
        data: {
          tag_id: tagId,
          task_id: taskId,
        }
      });
      return true;
    } catch (error) {
      console.error('Error assigning tag to task:', error);
      return false;
    }
  }

  async removeTagFromTask(tagId: string, taskId: string): Promise<boolean> {
    try {
      await this.prisma.taskTag.delete({
        where: {
          task_id_tag_id: {
            task_id: taskId,
            tag_id: tagId,
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error removing tag from task:', error);
      return false;
    }
  }

  private isValidHexColor(color: string): boolean {
    // Check if color matches hex format (#RGB or #RRGGBB)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }
}