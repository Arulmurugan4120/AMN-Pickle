import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Admin Authorization Middleware
 * Requires the user to have 'admin' role.
 * Must be used AFTER authMiddleware.
 */
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }

  next();
};
