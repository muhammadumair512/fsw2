/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { getUserDetails } from '@/services/UserService';

export async function GET(
  _request: Request,
  context: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = context.params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserDetails(userId);
    
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch user details' },
      { status: error.statusCode || 500 }
    );
  }
}