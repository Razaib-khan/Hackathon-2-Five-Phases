// src/utils/response.ts
// API response formatting utilities for the AIDO task management application

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export class ResponseUtil {
  /**
   * Send a successful response
   */
  static success<T>(res: Response, data?: T, message?: string, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T,
    page: number,
    pageSize: number,
    total: number,
    message?: string,
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(total / pageSize);
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        page_size: pageSize,
        total,
        total_pages: totalPages
      }
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    message: string,
    error?: any,
    statusCode: number = 500
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      message: message,
      timestamp: new Date().toISOString()
    };

    // In production, don't send the full error object for security
    if (process.env.NODE_ENV !== 'production' && error) {
      (response as any).details = error;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, null, 404);
  }

  /**
   * Send a bad request response
   */
  static badRequest(res: Response, message: string = 'Bad request'): Response {
    return this.error(res, message, null, 400);
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, null, 401);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, null, 403);
  }

  /**
   * Send a conflict response
   */
  static conflict(res: Response, message: string = 'Conflict'): Response {
    return this.error(res, message, null, 409);
  }

  /**
   * Send a validation error response
   */
  static validationError(res: Response, errors: string[]): Response {
    return this.error(res, 'Validation failed', { errors }, 400);
  }
}