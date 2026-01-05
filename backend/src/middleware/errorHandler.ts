// src/middleware/errorHandler.ts
// Error handling middleware for the AIDO task management application

import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

export interface ApplicationError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements ApplicationError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Correctly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: ApplicationError, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`Error occurred: ${err.message}`, {
    error: err,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default to 500 if no status code is provided
  const statusCode = err.statusCode || 500;

  // Sanitize error message for production
  let message = err.message;

  // Don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  ResponseUtil.error(res, message, err, statusCode);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new CustomError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// Validation error handler
export const handleValidationError = (res: Response, details: any): void => {
  ResponseUtil.validationError(res, Array.isArray(details) ? details : [details]);
};

// Duplicate field error handler
export const handleDuplicateFieldError = (err: any): CustomError => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${field}`;
  return new CustomError(message, 400);
};

// Validation error handler
export const handleValidationErrorDB = (err: any): CustomError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new CustomError(message, 400);
};

// JWT error handler
export const handleJWTError = (): CustomError => {
  return new CustomError('Invalid token. Please log in again.', 401);
};

// JWT expired error handler
export const handleJWTExpiredError = (): CustomError => {
  return new CustomError('Your token has expired. Please log in again.', 401);
};