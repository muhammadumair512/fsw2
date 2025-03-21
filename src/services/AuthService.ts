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
export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new AuthError(AuthErrorType.MISSING_FIELDS, 400);
  }
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }
  if (!user.isApproved && !user.isAdmin) {
    throw new AuthError(AuthErrorType.ACCOUNT_UNVERIFIED, 403);
  }
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 401);
  }
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }
  const resetToken = await createVerificationToken(
    `${user.id}:PASSWORD_RESET_TOKEN`,
  );
  await emailService.sendResetPasswordEmail({
    to: email,
    resetToken,
    name: `${user.firstName} ${user.lastName}`
  });
  return { success: true };
}
export async function resetPassword(
token: string, password: string) {
  const user = await findUserByResetToken(token);
  if (!user) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 400);
  }
  const hashedPassword = await hash(password, 12);
  await updatePassword(user.id, hashedPassword);
  await clearResetToken(user.id);
  return { success: true };
}
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await findUserByEmail(userId);
  if (!user) {
    throw new AuthError(AuthErrorType.USER_NOT_FOUND, 404);
  }
  const isPasswordValid = await compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AuthError(AuthErrorType.INVALID_CREDENTIALS, 401);
  }
  const hashedPassword = await hash(newPassword, 12);
  await updatePassword(userId, hashedPassword);
  return { success: true };
}
export async function verifyAccount(token: string, identifier: string) {
  try {
    const verifiedToken = await validateVerificationToken(identifier, token);
    return { success: true, userId: verifiedToken.id };
  } catch (error) {
    throw new AuthError(AuthErrorType.TOKEN_INVALID, 400);
  }
}