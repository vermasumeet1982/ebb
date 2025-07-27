import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { userRoutes } from './services/user/routes/user.routes';
import { authRoutes } from './services/user/routes/auth.routes';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler.middleware';
import { connectDatabase, prisma } from './shared/database/client';
import { initUserController } from './services/user/controllers/user.controller';
import { initAuthController } from './services/user/controllers/auth.controller';

// Load environment variables
dotenv.config();

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  // Rate limiting for API protection
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'eagle-bank-api',
    });
  });

  // Initialize controllers with dependencies
  initUserController(prisma);
  initAuthController(prisma);

  // API routes
  app.use('/', userRoutes);
  app.use('/', authRoutes);

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Eagle Bank API server running on port ${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
      console.log(`🏦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`👤 Available endpoints:`);
      console.log(`   POST /v1/users (Create user)`);
      console.log(`   GET  /v1/users/{userId} (Get user by ID) - Requires authentication & authorization (own data only)`);
      console.log(`   PATCH /v1/users/{userId} (Update user by ID) - Requires authentication & authorization (own data only) - Only updates when data changes`);
      console.log(`   POST /v1/auth/login (Authenticate user)`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      return new Promise((resolve) => {
        server.close(() => {
          console.log('✅ HTTP server closed');
          
          void (async (): Promise<void> => { // Added explicit return type
            try {
              await prisma.$disconnect();
              console.log('✅ Database connection closed');
              resolve();
              process.exit(0);
            } catch (error) {
              console.error('❌ Error during shutdown:', error);
              resolve();
              process.exit(1);
            }
          })();
        });

        // Force close after 10 seconds
        setTimeout(() => {
          console.error('❌ Could not close connections in time, forcefully shutting down');
          resolve();
          process.exit(1);
        }, 10000);
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => {
      void gracefulShutdown('SIGTERM');
    });
    process.on('SIGINT', () => {
      void gracefulShutdown('SIGINT');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
} 