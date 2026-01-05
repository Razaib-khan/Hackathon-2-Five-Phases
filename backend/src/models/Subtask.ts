// src/models/Subtask.ts
// Subtask model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface SubtaskCreateData {
  task_id: string;
  title: string;
  order_index: number;
}

export interface SubtaskUpdateData {
  title?: string;
  completed?: boolean;
  order_index?: number;
}

export interface SubtaskResponse {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export class SubtaskModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createSubtask(data: SubtaskCreateData): Promise<SubtaskResponse> {
    const subtask = await this.prisma.subtask.create({
      data: {
        task_id: data.task_id,
        title: data.title,
        order_index: data.order_index,
      },
      select: {
        id: true,
        task_id: true,
        title: true,
        completed: true,
        order_index: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: subtask.id,
      task_id: subtask.task_id,
      title: subtask.title,
      completed: subtask.completed,
      order_index: subtask.order_index,
      created_at: subtask.created_at,
      updated_at: subtask.updated_at,
    };
  }

  async getSubtaskById(id: string): Promise<SubtaskResponse | null> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      select: {
        id: true,
        task_id: true,
        title: true,
        completed: true,
        order_index: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!subtask) return null;

    return {
      id: subtask.id,
      task_id: subtask.task_id,
      title: subtask.title,
      completed: subtask.completed,
      order_index: subtask.order_index,
      created_at: subtask.created_at,
      updated_at: subtask.updated_at,
    };
  }

  async getSubtasksByTaskId(taskId: string): Promise<SubtaskResponse[]> {
    const subtasks = await this.prisma.subtask.findMany({
      where: { task_id: taskId },
      orderBy: { order_index: 'asc' },
      select: {
        id: true,
        task_id: true,
        title: true,
        completed: true,
        order_index: true,
        created_at: true,
        updated_at: true,
      }
    });

    return subtasks.map(subtask => ({
      id: subtask.id,
      task_id: subtask.task_id,
      title: subtask.title,
      completed: subtask.completed,
      order_index: subtask.order_index,
      created_at: subtask.created_at,
      updated_at: subtask.updated_at,
    }));
  }

  async updateSubtask(id: string, data: SubtaskUpdateData): Promise<SubtaskResponse> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.order_index !== undefined) updateData.order_index = data.order_index;

    const subtask = await this.prisma.subtask.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        task_id: true,
        title: true,
        completed: true,
        order_index: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: subtask.id,
      task_id: subtask.task_id,
      title: subtask.title,
      completed: subtask.completed,
      order_index: subtask.order_index,
      created_at: subtask.created_at,
      updated_at: subtask.updated_at,
    };
  }

  async deleteSubtask(id: string): Promise<boolean> {
    try {
      await this.prisma.subtask.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }
  }

  async toggleSubtaskCompletion(id: string): Promise<SubtaskResponse> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      select: { completed: true }
    });

    if (!subtask) {
      throw new Error('Subtask not found');
    }

    const updatedSubtask = await this.prisma.subtask.update({
      where: { id },
      data: {
        completed: !subtask.completed
      },
      select: {
        id: true,
        task_id: true,
        title: true,
        completed: true,
        order_index: true,
        created_at: true,
        updated_at: true,
      }
    });

    return {
      id: updatedSubtask.id,
      task_id: updatedSubtask.task_id,
      title: updatedSubtask.title,
      completed: updatedSubtask.completed,
      order_index: updatedSubtask.order_index,
      created_at: updatedSubtask.created_at,
      updated_at: updatedSubtask.updated_at,
    };
  }
}