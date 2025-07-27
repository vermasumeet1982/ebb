/**
 * Eagle Bank API - Main Entry Point
 * A REST API for Eagle Bank built with Node.js, TypeScript, PostgreSQL, and Prisma
 */

import { startServer } from './app';

// Start the Eagle Bank API server
startServer().catch((error) => {
  console.error('💥 Failed to start Eagle Bank API:', error);
  process.exit(1);
}); 