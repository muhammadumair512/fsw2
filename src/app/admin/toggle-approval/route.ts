/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { toggleApproval } from '@/services/UserService';

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
    const { userId, isApproved } = body;

    console.log('Toggle user approval request:', { userId, isApproved });

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await toggleApproval(userId, isApproved);

    return NextResponse.json({ 
      message: `User ${isApproved ? 'approved' : 'unapproved'} successfully`,
      user: {
        id: updatedUser.id,
        isApproved: updatedUser.isApproved
      }
    });
  } catch (error: any) {
    console.error('Failed to toggle user approval status:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to toggle user approval status' },
      { status: error.statusCode || 500 }
    );
  }
}