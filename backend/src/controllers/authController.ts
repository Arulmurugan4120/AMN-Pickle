import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import { env } from '../config/env';
import { z } from 'zod';

/**
 * Auth Controller — Fintech-Grade User Authentication
 * Features: Admin code verification, role-based reset codes, Zod validation, JWT.
 */

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim(),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['customer', 'admin']).default('customer'),
  adminCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  resetCode: z.string().min(1, 'Reset code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['customer', 'admin']).default('customer'),
});

const generateToken = (user: { _id: any; email: string; role: string }): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

class AuthController {
  /**
   * POST /api/auth/register
   * Admin registration requires ADMIN_CODE for security.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, adminCode } = registerSchema.parse(req.body);

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable. Please try again later.' });
      }

      // Verify admin code if registering as admin
      if (role === 'admin') {
        if (!adminCode || adminCode !== env.ADMIN_CODE) {
          return res.status(403).json({ success: false, message: 'Invalid admin code. Contact your administrator.' });
        }
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({ name, email, password, role });
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: error.errors.map((e: any) => e.message).join(', ') });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable. Please try again later.' });
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: error.errors.map((e: any) => e.message).join(', ') });
      }
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Admin uses ADMIN_RESET_CODE, User uses USER_RESET_CODE.
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, resetCode, newPassword, role } = resetPasswordSchema.parse(req.body);

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database unavailable.' });
      }

      // Verify the correct reset code based on role
      const expectedCode = role === 'admin' ? env.ADMIN_RESET_CODE : env.USER_RESET_CODE;
      if (resetCode !== expectedCode) {
        return res.status(403).json({ success: false, message: `Invalid ${role === 'admin' ? 'Admin' : 'User'} reset code.` });
      }

      // Find user with matching email and role
      const user = await User.findOne({ email, role }).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this email and role.' });
      }

      // Update password (pre-save hook will hash it)
      user.password = newPassword;
      await user.save();

      return res.status(200).json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: error.errors.map((e: any) => e.message).join(', ') });
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated.' });
      if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Database unavailable.' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      return res.status(200).json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
