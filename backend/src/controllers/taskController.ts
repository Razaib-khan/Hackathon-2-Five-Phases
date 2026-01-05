// src/controllers/taskController.ts
// Task controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { TaskModel } from '../models/Task';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the task model with prisma client
const taskModel = new TaskModel(prisma);

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.user_id;
    const {
      page = '1',
      page_size = '20',
      sort_by,
      sort_order,
      completed,
      priority,
      status,
      due_date,
      tags,
      category,
      search,
      start_date,
      end_date
    } = req.query;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    // Parse query parameters
    const filters: any = {
      page: parseInt(page as string, 10) || 1,
      page_size: parseInt(page_size as string, 10) || 20,
      sort_by: sort_by as string,
      sort_order: sort_order === 'asc' ? 'asc' : 'desc',
      completed: completed !== undefined ? completed === 'true' : undefined,
      priority: priority as string | string[],
      status: status as string | string[],
      due_date: due_date as string,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : undefined,
      category: category as string,
      search: search as string,
      start_date: start_date as string,
      end_date: end_date as string,
    };

    // Handle array values from query parameters
    if (req.query.priority && typeof req.query.priority === 'string') {
      filters.priority = req.query.priority.split(',');
    }
    if (req.query.status && typeof req.query.status === 'string') {
      filters.status = req.query.status.split(',');
    }

    const result = await taskModel.getTasksByUserId(userId, filters);

    ResponseUtil.paginated(
      res,
      result.tasks,
      filters.page,
      filters.page_size,
      result.total,
      'User tasks retrieved successfully'
    );
  } catch (error) {
    logger.error('Get user tasks error:', error);
    ResponseUtil.error(res, 'Failed to retrieve user tasks', error);
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.user_id;
    const {
      title,
      description,
      priority = 'none',
      due_date,
      estimated_time,
      category,
      position,
      reminder_time
    } = req.body;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    // Validate required fields
    if (!title) {
      ResponseUtil.badRequest(res, 'Title is required');
      return;
    }

    const newTask = await taskModel.createTask({
      user_id: userId,
      title,
      description,
      priority,
      due_date: due_date ? new Date(due_date) : undefined,
      estimated_time,
      category,
      position,
      reminder_time: reminder_time ? new Date(reminder_time) : undefined
    });

    ResponseUtil.success(res, newTask, 'Task created successfully', 201);
  } catch (error) {
    logger.error('Create task error:', error);
    ResponseUtil.error(res, 'Failed to create task', error);
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const task = await taskModel.getTaskById(taskId);

    if (!task) {
      ResponseUtil.notFound(res, 'Task not found');
      return;
    }

    ResponseUtil.success(res, task, 'Task retrieved successfully');
  } catch (error) {
    logger.error('Get task error:', error);
    ResponseUtil.error(res, 'Failed to retrieve task', error);
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const updateData = req.body;

    if (!taskId) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const updatedTask = await taskModel.updateTask(taskId, updateData);

    ResponseUtil.success(res, updatedTask, 'Task updated successfully');
  } catch (error) {
    logger.error('Update task error:', error);
    ResponseUtil.error(res, 'Failed to update task', error);
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const success = await taskModel.deleteTask(taskId);

    if (success) {
      ResponseUtil.success(res, null, 'Task deleted successfully');
    } else {
      ResponseUtil.error(res, 'Failed to delete task');
    }
  } catch (error) {
    logger.error('Delete task error:', error);
    ResponseUtil.error(res, 'Failed to delete task', error);
  }
};

export const toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    const updatedTask = await taskModel.toggleTaskCompletion(taskId);

    ResponseUtil.success(res, updatedTask, 'Task completion status updated successfully');
  } catch (error) {
    logger.error('Toggle task completion error:', error);
    ResponseUtil.error(res, 'Failed to toggle task completion status', error);
  }
};