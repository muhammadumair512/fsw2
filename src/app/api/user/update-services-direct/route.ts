import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { updateServicesDirect } from '@/services/ServiceManagementService';

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
    await updateServicesDirect(session.user.id, data);

    return NextResponse.json({ message: 'Services updated successfully' });
  } catch (error: any) {
    console.error('Failed to update services:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update services' },
      { status: error.statusCode || 500 }
    );
  }
}