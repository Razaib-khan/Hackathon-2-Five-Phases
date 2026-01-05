// src/validators/subtaskValidator.ts
// Subtask validation utilities for the AIDO task management application

import Joi from 'joi';

// Validation schema for creating a subtask
export const validateSubtaskCreation = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    completed: Joi.boolean().optional()
  });

  return schema.validate(data);
};

// Validation schema for updating a subtask
export const validateSubtaskUpdate = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    completed: Joi.boolean().optional()
  });

  return schema.validate(data);
};