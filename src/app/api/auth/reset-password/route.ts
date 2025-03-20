import { NextResponse } from 'next/server';

import { forgotPassword } from '@/services/AuthService';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log(`Password reset requested for email: ${email}`);

    await forgotPassword(email);

    // For security reasons, always return success even if email doesn't exist
    return NextResponse.json({ 
      message: 'If a user with that email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Failed to request password reset:', error);
    
    // Still return a 200 for security (don't reveal if email exists)
    return NextResponse.json({ 
      message: 'If a user with that email exists, a password reset link has been sent.',
    });
  }
}