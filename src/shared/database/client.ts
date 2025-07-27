import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance
export const prisma = new PrismaClient();

/**
 * Connect to the database
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Graceful shutdown handlers
process.on('beforeExit', () => {
  void disconnectDatabase();
});

process.on('SIGINT', () => {
  void disconnectDatabase();
});

process.on('SIGTERM', () => {
  void disconnectDatabase();
}); 