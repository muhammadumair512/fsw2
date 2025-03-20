import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { getProfileData } from '@/services/UserService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await getProfileData(session.user.id);

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch user profile' },
      { status: error.statusCode || 500 }
    );
  }
}