/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { processUpdateRequest } from '@/services/UpdateRequestService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId, approved, adminComment } = await request.json();
    
    await processUpdateRequest(requestId, approved, adminComment);

    return NextResponse.json({ 
      message: `Request ${approved ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error: any) {
    console.error('Failed to process request:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process request' },
      { status: error.statusCode || 500 }
    );
  }
}