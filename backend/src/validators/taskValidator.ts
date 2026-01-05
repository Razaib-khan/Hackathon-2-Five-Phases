// src/validators/taskValidator.ts
// Task validation utilities for the AIDO task management application

import Joi from 'joi';

// Validation schema for creating a task
export const validateTaskCreation = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'none').optional(),
    due_date: Joi.date().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    category: Joi.string().max(50).optional(),
    position: Joi.number().integer().min(0).optional(),
    reminder_time: Joi.date().optional()
  });

  return schema.validate(data);
};

// Validation schema for updating a task
export const validateTaskUpdate = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'none').optional(),
    due_date: Joi.date().optional(),
    estimated_time: Joi.number().integer().min(0).optional(),
    category: Joi.string().max(50).optional(),
    position: Joi.number().integer().min(0).optional(),
    reminder_time: Joi.date().optional(),
    completed: Joi.boolean().optional()
  });

  return schema.validate(data);
};

// Validation schema for task filtering
export const validateTaskFilter = (data: any) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    page_size: Joi.number().integer().min(1).max(100).optional(),
    sort_by: Joi.string().optional(),
    sort_order: Joi.string().valid('asc', 'desc').optional(),
    completed: Joi.boolean().optional(),
    priority: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    status: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    due_date: Joi.string().optional(),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    category: Joi.string().optional(),
    search: Joi.string().optional(),
    start_date: Joi.string().optional(),
    end_date: Joi.string().optional()
  });

  return schema.validate(data);
};