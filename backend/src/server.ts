import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { applySecurityMiddleware } from './middleware/security';
import { requestTracer, requestAuditor } from './middleware/observability';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middleware/errorHandler';
import productController from './controllers/productController';
import logger from './utils/logger';

/**
 * AMN Pickle - Fintech Grade Payment Gateway
 */

connectDB();

const app = express();

app.use(requestTracer);
app.use(requestAuditor);

app.use(express.json({ limit: '10kb' }));
applySecurityMiddleware(app);

// Serve uploaded product images as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', apiRoutes);

// In production, serve the frontend build
if (env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  // SPA: Serve index.html for any non-API route
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

// Global Error Resilience
app.use(errorHandler);

const PORT = Number(env.PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Fintech Store Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  productController.seedInitialProducts();
});

/**
 * GRACEFUL SHUTDOWN HANDLER
 * Ensures no in-flight requests are dropped and DB connections close cleanly.
 */
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (err: any) {
      logger.error('Error during MongoDB connection close:', { error: err.message });
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled Promise Rejections (Last line of defense)
process.on('unhandledRejection', (err: any) => {
  logger.error(`Critical Unhandled Rejection: ${err.message}`, { stack: err.stack });
});

export default app;
