import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { AuthErrorType } from '@/lib/handlers/errors';
import AuthError from '@/lib/handlers/errors/types/AuthError';

/**
 * Creates a verification token for password reset or email verification
 */
export async function createVerificationToken(
  identifier: string,
  expiresIn: number = 3600000 // 1 hour in milliseconds
) {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set expiry time
  const tokenExpiry = new Date();
  tokenExpiry.setTime(tokenExpiry.getTime() + expiresIn);
  
  // Save to database
  await prisma.user.update({
    where: {
      id: identifier.split(':')[0],
    },
    data: {
      resetToken: token,
      resetTokenExpiry: tokenExpiry,
    },
  });
  
  return token;
}

/**
 * Validates a verification token
 */
export async function validateVerificationToken(
  identifier: string,
  token: string
) {
  const userId = identifier?.split(':')[0];
  
  if (!userId) {
    throw new Error('Invalid identifier');
  }
  
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
  
  if (!user) {
    throw new Error('Invalid or expired token');
  }
  
  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Find a user by reset token
 */
export async function findUserByResetToken(token: string) {
  return prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
}

/**
 * Clear reset token for a user
 */
export async function clearResetToken(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}