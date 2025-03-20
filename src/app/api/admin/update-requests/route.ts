/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { getUpdateRequests } from '@/services/UpdateRequestService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requests = await getUpdateRequests();
    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('Failed to fetch update requests:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch update requests' },
      { status: error.statusCode || 500 }
    );
  }
}