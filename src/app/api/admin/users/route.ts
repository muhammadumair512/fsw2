/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { getUsers } from '@/services/UserService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch users' },
      { status: error.statusCode || 500 }
    );
  }
}