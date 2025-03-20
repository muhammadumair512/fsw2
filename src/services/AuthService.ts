/* eslint-disable @typescript-eslint/no-unused-vars */
import { hash, compare } from 'bcryptjs';

import AuthError, { AuthErrorType } from '@/lib/handlers/errors/types/AuthError';
import { 
  createVerificationToken,
  validateVerificationToken, 
  findUserByResetToken,
  clearResetToken
} from '@/repositories/AuthRepository';
import { findUserByEmail, updatePassword } from '@/repositories/UserRepository';
import { EmailService } from './EmailService';

const emailService = new EmailService();

/**
 * Handle user login
 */
export async function loginUser(email: string, password: string) {
  // Validate inputs
  if (!email || !password) {
    throw new AuthError(AuthErrorType.MISSING_FIELDS, 400);
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }

  // Check if account is approved (except for admin)
  if (!user.isApproved && !user.isAdmin) {
    throw new AuthError(AuthErrorType.ACCOUNT_UNVERIFIED, 403);
  }

  // Verify password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 401);
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Initiate password reset process
 */
export async function forgotPassword(email: string) {
  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }

  // Generate and store reset token
  const resetToken = await createVerificationToken(
    `${user.id}:PASSWORD_RESET_TOKEN`,
  );

  // Send password reset email
  await emailService.sendResetPasswordEmail({
    to: email,
    resetToken,
    name: `${user.firstName} ${user.lastName}`
  });

  return { success: true };
}

/**
 * Reset password with token
 */
export async function resetPassword(
token: string, password: string, newPassword: any) {
  // Find user by reset token
  const user = await findUserByResetToken(token);
  if (!user) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 400);
  }

  // Hash new password
  const hashedPassword = await hash(password, 12);

  // Update user password and clear reset token
  await updatePassword(user.id, hashedPassword);
  await clearResetToken(user.id);

  return { success: true };
}

/**
 * Change user's password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Find user
  const user = await findUserByEmail(userId);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }

  // Verify current password
  const isPasswordValid = await compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 401);
  }

  // Hash new password
  const hashedPassword = await hash(newPassword, 12);

  // Update password
  await updatePassword(userId, hashedPassword);

  return { success: true };
}

/**
 * Verify account with token
 */
export async function verifyAccount(token: string, identifier: string) {
  try {
    const verifiedToken = await validateVerificationToken(identifier, token);
    
    // Mark user as verified/approved
    // Additional logic can be added here
    
    return { success: true, userId: verifiedToken.id };
  } catch (error) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 400);
  }
}