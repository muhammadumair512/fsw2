import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { changePassword } from '@/services/AuthService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();
    await changePassword(session.user.id, currentPassword, newPassword);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Failed to change password:', error);
    return NextResponse.json(
      { message: error.type || 'Failed to change password' },
      { status: error.statusCode || 500 }
    );
  }
}