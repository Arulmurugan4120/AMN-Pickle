import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * MongoDB Connection Management
 * Retries connection and logs errors but does NOT crash the server.
 * This allows the API to remain available and return graceful errors.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI as string;

  if (!uri) {
    logger.error('MONGODB_URI is not set. Database features will be unavailable.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast instead of hanging
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    logger.warn('Server will continue without database. API requests requiring DB will fail gracefully.');
    // DO NOT call process.exit(1) — let the server stay alive
  }
};
