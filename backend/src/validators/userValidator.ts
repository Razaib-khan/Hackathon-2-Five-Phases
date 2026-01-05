// src/validators/userValidator.ts
// User validation utilities for the AIDO task management application

import Joi from 'joi';

export const userRegistrationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).*$'))
    .messages({
      'string.min': 'Password should have at least 6 characters',
      'string.max': 'Password should not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .min(1)
    .messages({
      'string.min': 'Password is required',
      'any.required': 'Password is required'
    })
});

export const userUpdateSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .optional()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>\\/?]).*$'))
    .messages({
      'string.min': 'Password should have at least 6 characters',
      'string.max': 'Password should not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean value'
    })
});

export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

export const validateUserRegistration = (data: any) => {
  return userRegistrationSchema.validate(data, { abortEarly: false });
};

export const validateUserLogin = (data: any) => {
  return userLoginSchema.validate(data, { abortEarly: false });
};

export const validateUserUpdate = (data: any) => {
  return userUpdateSchema.validate(data, { abortEarly: false });
};

export const validateRefreshToken = (data: any) => {
  return refreshTokenSchema.validate(data, { abortEarly: false });
};