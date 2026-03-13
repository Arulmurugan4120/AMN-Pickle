import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

/**
 * Security Middleware Configuration
 * Applies Helmet, Rate Limiting, and CORS to the express application.
 */
export const applySecurityMiddleware = (app: Express) => {
  // 1. HTTP Security Headers with CSP for Razorpay
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        "frame-src": ["'self'", "https://api.razorpay.com", "https://tds.razorpay.com"],
        "connect-src": ["'self'", "https://api.razorpay.com"],
        "img-src": ["'self'", "data:", "https://*.razorpay.com"],
      },
    },
  }));

  // 2. CORS Configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature', 'x-request-id'],
  }));

  // 3. Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);
};
