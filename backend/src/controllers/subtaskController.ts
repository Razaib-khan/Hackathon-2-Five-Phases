// src/controllers/subtaskController.ts
// Subtask controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { SubtaskModel } from '../models/Subtask';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the subtask model with prisma client
const subtaskModel = new SubtaskModel(prisma);

export const createSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.task_id;
    const { title, description, completed } = req.body;

    // Validate task ID format if needed
    if (!taskId) {
      ResponseUtil.badRequest(res, 'Task ID is required');
      return;
    }

    // Validate required fields
    if (!title) {
      ResponseUtil.badRequest(res, 'Subtask title is required');
      return;
    }

    const newSubtask = await subtaskModel.createSubtask({
      task_id: taskId,
      title,
      description,
      completed: completed || false
    });

    ResponseUtil.success(res, newSubtask, 'Subtask created successfully', 201);
  } catch (error) {
    logger.error('Create subtask error:', error);
    ResponseUtil.error(res, 'Failed to create subtask', error);
  }
};

export const updateSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtaskId = req.params.id;
    const updateData = req.body;

    if (!subtaskId) {
      ResponseUtil.badRequest(res, 'Subtask ID is required');
      return;
    }

    const updatedSubtask = await subtaskModel.updateSubtask(subtaskId, updateData);

    ResponseUtil.success(res, updatedSubtask, 'Subtask updated successfully');
  } catch (error) {
    logger.error('Update subtask error:', error);
    ResponseUtil.error(res, 'Failed to update subtask', error);
  }
};

export const deleteSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtaskId = req.params.id;

    if (!subtaskId) {
      ResponseUtil.badRequest(res, 'Subtask ID is required');
      return;
    }

    const success = await subtaskModel.deleteSubtask(subtaskId);

    if (success) {
      ResponseUtil.success(res, null, 'Subtask deleted successfully');
    } else {
      ResponseUtil.error(res, 'Failed to delete subtask');
    }
  } catch (error) {
    logger.error('Delete subtask error:', error);
    ResponseUtil.error(res, 'Failed to delete subtask', error);
  }
};

export const toggleSubtaskCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const subtaskId = req.params.id;

    if (!subtaskId) {
      ResponseUtil.badRequest(res, 'Subtask ID is required');
      return;
    }

    const updatedSubtask = await subtaskModel.toggleSubtaskCompletion(subtaskId);

    ResponseUtil.success(res, updatedSubtask, 'Subtask completion status updated successfully');
  } catch (error) {
    logger.error('Toggle subtask completion error:', error);
    ResponseUtil.error(res, 'Failed to toggle subtask completion status', error);
  }
};