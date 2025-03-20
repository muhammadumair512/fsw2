import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { updateProfile } from '@/services/UserService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await updateProfile(session.user.id, data);

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update profile' },
      { status: error.statusCode || 500 }
    );
  }
}