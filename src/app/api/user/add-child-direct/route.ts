import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { addChildDirect } from '@/services/ChildService';

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
    const result = await addChildDirect(session.user.id, data);

    return NextResponse.json({ 
      message: 'Child added successfully',
      child: result
    });
  } catch (error: any) {
    console.error('Failed to add child:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to add child' },
      { status: error.statusCode || 500 }
    );
  }
}