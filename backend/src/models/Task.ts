// src/models/Task.ts
// Task model for the AIDO task management application

import { PrismaClient } from '@prisma/client';

export interface TaskCreateData {
  user_id: string;
  title: string;
  description?: string;
  priority?: string; // high, medium, low, none
  due_date?: Date;
  estimated_time?: number;
  category?: string;
  position?: number;
  reminder_time?: Date;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: string; // high, medium, low, none
  due_date?: Date;
  estimated_time?: number;
  category?: string;
  position?: number;
  reminder_time?: Date;
  time_spent?: number;
  status?: string; // todo, in_progress, done
}

export interface TaskFilterOptions {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  completed?: boolean;
  priority?: string | string[]; // Can be single or array
  status?: string | string[]; // Can be single or array
  due_date?: string; // ISO 8601 date string
  tags?: string[]; // array of tag IDs
  category?: string;
  search?: string; // search term for title/description
  start_date?: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string
}

export interface TaskResponse {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string; // high, medium, low, none
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  estimated_time?: number;
  category?: string;
  position?: number;
  reminder_time?: Date;
  time_spent: number;
  status: string; // todo, in_progress, done
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
}

export class TaskModel {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createTask(data: TaskCreateData): Promise<TaskResponse> {
    const task = await this.prisma.task.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        priority: data.priority || 'none',
        due_date: data.due_date,
        estimated_time: data.estimated_time,
        category: data.category,
        position: data.position,
        reminder_time: data.reminder_time,
        status: 'todo', // Default status
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
        estimated_time: true,
        category: true,
        position: true,
        reminder_time: true,
        time_spent: true,
        status: true,
      }
    });

    return {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority,
      due_date: task.due_date || undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at || undefined,
      estimated_time: task.estimated_time || undefined,
      category: task.category || undefined,
      position: task.position || undefined,
      reminder_time: task.reminder_time || undefined,
      time_spent: task.time_spent,
      status: task.status,
    };
  }

  async getTaskById(id: string): Promise<TaskResponse | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
        estimated_time: true,
        category: true,
        position: true,
        reminder_time: true,
        time_spent: true,
        status: true,
      }
    });

    if (!task) return null;

    return {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority,
      due_date: task.due_date || undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at || undefined,
      estimated_time: task.estimated_time || undefined,
      category: task.category || undefined,
      position: task.position || undefined,
      reminder_time: task.reminder_time || undefined,
      time_spent: task.time_spent,
      status: task.status,
    };
  }

  async getTasksByUserId(userId: string, filters?: TaskFilterOptions): Promise<TaskListResponse> {
    // Build query conditions based on filters
    const where: any = { user_id: userId };

    if (filters?.completed !== undefined) {
      where.completed = filters.completed;
    }

    if (filters?.priority) {
      if (Array.isArray(filters.priority)) {
        where.priority = { in: filters.priority };
      } else {
        where.priority = filters.priority;
      }
    }

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const page = filters?.page || 1;
    const pageSize = filters?.page_size || 20;
    const skip = (page - 1) * pageSize;

    // Determine sort order
    const orderBy: any = {};
    if (filters?.sort_by) {
      orderBy[filters.sort_by] = filters.sort_order || 'desc';
    } else {
      orderBy.created_at = 'desc'; // Default sort
    }

    // Get tasks with filters
    const tasks = await this.prisma.task.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
        estimated_time: true,
        category: true,
        position: true,
        reminder_time: true,
        time_spent: true,
        status: true,
      }
    });

    // Get total count
    const total = await this.prisma.task.count({ where });

    // Format response
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority,
      due_date: task.due_date || undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at || undefined,
      estimated_time: task.estimated_time || undefined,
      category: task.category || undefined,
      position: task.position || undefined,
      reminder_time: task.reminder_time || undefined,
      time_spent: task.time_spent,
      status: task.status,
    }));

    return {
      tasks: formattedTasks,
      total,
    };
  }

  async updateTask(id: string, data: TaskUpdateData): Promise<TaskResponse> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completed_at = new Date();
      } else {
        updateData.completed_at = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.estimated_time !== undefined) updateData.estimated_time = data.estimated_time;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.reminder_time !== undefined) updateData.reminder_time = data.reminder_time;
    if (data.time_spent !== undefined) updateData.time_spent = data.time_spent;
    if (data.status !== undefined) updateData.status = data.status;

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
        estimated_time: true,
        category: true,
        position: true,
        reminder_time: true,
        time_spent: true,
        status: true,
      }
    });

    return {
      id: task.id,
      user_id: task.user_id,
      title: task.title,
      description: task.description || undefined,
      completed: task.completed,
      priority: task.priority,
      due_date: task.due_date || undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
      completed_at: task.completed_at || undefined,
      estimated_time: task.estimated_time || undefined,
      category: task.category || undefined,
      position: task.position || undefined,
      reminder_time: task.reminder_time || undefined,
      time_spent: task.time_spent,
      status: task.status,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await this.prisma.task.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  async toggleTaskCompletion(id: string): Promise<TaskResponse> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { completed: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
        completed_at: !task.completed ? new Date() : null
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        description: true,
        completed: true,
        priority: true,
        due_date: true,
        created_at: true,
        updated_at: true,
        completed_at: true,
        estimated_time: true,
        category: true,
        position: true,
        reminder_time: true,
        time_spent: true,
        status: true,
      }
    });

    return {
      id: updatedTask.id,
      user_id: updatedTask.user_id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      completed: updatedTask.completed,
      priority: updatedTask.priority,
      due_date: updatedTask.due_date || undefined,
      created_at: updatedTask.created_at,
      updated_at: updatedTask.updated_at,
      completed_at: updatedTask.completed_at || undefined,
      estimated_time: updatedTask.estimated_time || undefined,
      category: updatedTask.category || undefined,
      position: updatedTask.position || undefined,
      reminder_time: updatedTask.reminder_time || undefined,
      time_spent: updatedTask.time_spent,
      status: updatedTask.status,
    };
  }
}