import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest } from '../schema/auth.schema';
import { UnauthorizedError } from '@/shared/utils/error.utils';

/**
 * Login a user and return JWT token
 */
export async function loginUser(
  prisma: PrismaClient,
  data: LoginRequest
): Promise<{ accessToken: string }> {
  // 1. Find user by email (case-insensitive)
  const user = await prisma.user.findUnique({
    where: {
      email: data.email.toLowerCase(),
    },
  });

  // 2. Check if user exists
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // 3. Verify password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // 4. Generate JWT token
  const accessToken = generateJwtToken(user.userId, user.email);

  return { accessToken };
}

/**
 * Generate JWT token for user
 */
function generateJwtToken(userId: string, email: string): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
} 