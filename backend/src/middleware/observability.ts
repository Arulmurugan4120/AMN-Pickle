import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

/**
 * Request Tracing Middleware
 * Injects a unique Correlation ID (Request ID) into every request.
 * Attaches the ID to the logger's metadata for end-to-end observability.
 */
export const requestTracer = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request object for downstream use
  (req as any).requestId = requestId;
  
  // Set header in response for client-side tracing
  res.setHeader('x-request-id', requestId as string);

  // Configure logger for this request lifecycle
  const requestLogger = logger.child({ requestId });
  (req as any).logger = requestLogger;

  next();
};

/**
 * Audit Middleware
 * Logs basic information about every incoming request.
 */
export const requestAuditor = (req: Request, res: Response, next: NextFunction) => {
  const { method, path, ip } = req;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    (req as any).logger.info(`HTTP ${method} ${path} ${statusCode} - ${duration}ms`, {
      ip,
      method,
      path,
      statusCode,
      duration
    });
  });

  next();
};
