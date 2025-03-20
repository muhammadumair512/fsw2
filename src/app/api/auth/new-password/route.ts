import { NextResponse } from 'next/server';

import { resetPassword } from '@/services/AuthService';
import { findUserByResetToken } from '@/repositories/AuthRepository';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    // Find user by reset token
    const user = await findUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Reset password
    await resetPassword(token, `${user.id}:PASSWORD_RESET_TOKEN`, password);

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Failed to reset password:', error);
    return NextResponse.json(
      { 
        message: error.type || 'Failed to reset password',
        details: error.message
      },
      { status: error.statusCode || 500 }
    );
  }
}