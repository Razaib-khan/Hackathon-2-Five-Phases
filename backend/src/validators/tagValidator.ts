// src/validators/tagValidator.ts
// Tag validation utilities for the AIDO task management application

import Joi from 'joi';

// Validation schema for creating a tag
export const validateTagCreation = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional()
  });

  return schema.validate(data);
};

// Validation schema for updating a tag
export const validateTagUpdate = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional()
  });

  return schema.validate(data);
};

// Validation schema for tag assignment to task
export const validateTagAssignment = (data: any) => {
  const schema = Joi.object({
    task_id: Joi.string().required(),
    tag_id: Joi.string().required()
  });

  return schema.validate(data);
};