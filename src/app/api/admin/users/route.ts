/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { getUsers } from '@/services/UserService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug the session to see what's available
    console.log("Admin session check:", {
      sessionExists: !!session,
      user: session?.user,
      isAdmin: session?.user?.isAdmin
    });

    if (!session?.user || session.user.isAdmin !== true) {
      console.log("User is not admin, returning 401");
      return NextResponse.json(
        { message: 'Unauthorized. Admin privileges required.' },
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