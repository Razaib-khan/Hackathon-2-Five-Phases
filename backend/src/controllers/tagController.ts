// src/controllers/tagController.ts
// Tag controller for the AIDO task management application

import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { TagModel } from '../models/Tag';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// Initialize the tag model with prisma client
const tagModel = new TagModel(prisma);

export const getUserTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.user_id;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    const tags = await tagModel.getTagsByUserId(userId);

    ResponseUtil.success(res, tags, 'User tags retrieved successfully');
  } catch (error) {
    logger.error('Get user tags error:', error);
    ResponseUtil.error(res, 'Failed to retrieve user tags', error);
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.user_id;
    const { name, color } = req.body;

    // Validate user ID format if needed
    if (!userId) {
      ResponseUtil.badRequest(res, 'User ID is required');
      return;
    }

    // Validate required fields
    if (!name) {
      ResponseUtil.badRequest(res, 'Tag name is required');
      return;
    }

    const newTag = await tagModel.createTag({
      user_id: userId,
      name,
      color
    });

    ResponseUtil.success(res, newTag, 'Tag created successfully', 201);
  } catch (error) {
    logger.error('Create tag error:', error);
    ResponseUtil.error(res, 'Failed to create tag', error);
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tagId = req.params.id;
    const updateData = req.body;

    if (!tagId) {
      ResponseUtil.badRequest(res, 'Tag ID is required');
      return;
    }

    const updatedTag = await tagModel.updateTag(tagId, updateData);

    ResponseUtil.success(res, updatedTag, 'Tag updated successfully');
  } catch (error) {
    logger.error('Update tag error:', error);
    ResponseUtil.error(res, 'Failed to update tag', error);
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tagId = req.params.id;

    if (!tagId) {
      ResponseUtil.badRequest(res, 'Tag ID is required');
      return;
    }

    const success = await tagModel.deleteTag(tagId);

    if (success) {
      ResponseUtil.success(res, null, 'Tag deleted successfully');
    } else {
      ResponseUtil.error(res, 'Failed to delete tag');
    }
  } catch (error) {
    logger.error('Delete tag error:', error);
    ResponseUtil.error(res, 'Failed to delete tag', error);
  }
};

export const assignTagToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.task_id;
    const tagId = req.params.tag_id;

    if (!taskId || !tagId) {
      ResponseUtil.badRequest(res, 'Task ID and Tag ID are required');
      return;
    }

    const success = await tagModel.assignTagToTask(taskId, tagId);

    if (success) {
      ResponseUtil.success(res, null, 'Tag assigned to task successfully');
    } else {
      ResponseUtil.error(res, 'Failed to assign tag to task');
    }
  } catch (error) {
    logger.error('Assign tag to task error:', error);
    ResponseUtil.error(res, 'Failed to assign tag to task', error);
  }
};

export const removeTagFromTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.task_id;
    const tagId = req.params.tag_id;

    if (!taskId || !tagId) {
      ResponseUtil.badRequest(res, 'Task ID and Tag ID are required');
      return;
    }

    const success = await tagModel.removeTagFromTask(taskId, tagId);

    if (success) {
      ResponseUtil.success(res, null, 'Tag removed from task successfully');
    } else {
      ResponseUtil.error(res, 'Failed to remove tag from task');
    }
  } catch (error) {
    logger.error('Remove tag from task error:', error);
    ResponseUtil.error(res, 'Failed to remove tag from task', error);
  }
};