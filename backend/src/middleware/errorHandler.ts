import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

/**
 * Enterprise Error Handling Middleware.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { 
    path: req.path, 
    method: req.method,
    stack: err.stack 
  });

  // Zod validation error
  if (err.name === 'ZodError') {
    const message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return ApiResponse.error(res, `Validation Error: ${message}`, 400);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Resource not found with id of ${err.value}`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return ApiResponse.error(res, 'Duplicate field value entered', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    return ApiResponse.error(res, message, 400);
  }

  return ApiResponse.error(res, err.message || 'Internal Server Error', err.statusCode || 500);
};
