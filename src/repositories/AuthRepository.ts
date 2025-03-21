import { AuthErrorType } from '@/lib/handlers/errors'; 
import AuthError from '@/lib/handlers/errors/types/AuthError'; 
import { prisma } from '@/lib/prisma'; 


export async function createVerificationToken(
  identifier: string,
  expiresIn: number = 24 * 60 * 60 * 1000 
) {
  const token = Math.random().toString(36).substring(2, 15);
  
  
  
  const userId = identifier.split(':')[0];
  
  
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now() + expiresIn),
    },
  });
  
  return token;
}


export async function validateVerificationToken(
  identifier: string,
  token: string
) {
  const userId = identifier?.split(':')[0];
  
  if (!userId) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 401);
  }
  
  
  const verificationRequest = await prisma.user.findFirst({
    where: {
      id: userId,
      resetToken: token,
    },
  });
  
  if (!verificationRequest) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 401);
  }
  
  
  if (verificationRequest.resetTokenExpiry && verificationRequest.resetTokenExpiry < new Date()) {
    throw new AuthError(AuthErrorType.TOKEN_EXPIRED, 401);
  }
  
  return {
    id: verificationRequest.id,
    email: verificationRequest.email,
  };
}

/**
 * Find a user by reset token
 */
export async function findUserByResetToken(token: string) {
  const verificationRequest = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
  
  return verificationRequest;
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