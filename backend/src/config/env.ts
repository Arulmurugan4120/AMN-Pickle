import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('pickle-store-jwt-secret-change-in-production-2024'),
  ADMIN_CODE: z.string().min(4, 'ADMIN_CODE is required').default('ADMIN2024'),
  USER_RESET_CODE: z.string().min(4, 'USER_RESET_CODE is required').default('USERRESET2024'),
  ADMIN_RESET_CODE: z.string().min(4, 'ADMIN_RESET_CODE is required').default('ADMINRESET2024'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  CORS_ORIGIN: z.string().default('*'),
});

/**
 * Validate and export environment variables at startup.
 * The process will exit if validation fails, preventing insecure or misconfigured states.
 */
const validateEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    console.log('Environment variables validated successfully');
    return parsed;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      console.error('Invalid environment variables:');
      error.errors.forEach((err: any) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('Failed to parse environment variables:', error.message);
    }
    process.exit(1);
  }
};

export const env = validateEnv();
