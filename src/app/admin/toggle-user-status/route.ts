/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { toggleActiveStatus } from '@/services/UserService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, isActive } = body;

    console.log('Toggle user status request:', { userId, isActive });

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await toggleActiveStatus(userId, isActive);

    return NextResponse.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }
    });
  } catch (error: any) {
    console.error('Failed to toggle user status:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to toggle user status' },
      { status: error.statusCode || 500 }
    );
  }
}