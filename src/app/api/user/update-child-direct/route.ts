import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { updateChildDirect } from '@/services/ChildService';

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
    console.log('Updating child with ID:', data.id);
    console.log('User ID:', session.user.id);
    console.log('Full data:', data);

    if (!data.id) {
      return NextResponse.json(
        { message: 'Child ID is required' },
        { status: 400 }
      );
    }

    const updatedChild = await updateChildDirect(session.user.id, data);
    
    console.log('Child updated successfully:', updatedChild);
    return NextResponse.json({ 
      message: 'Child updated successfully',
      child: updatedChild
    });
  } catch (error: any) {
    console.error('Failed to update child:', error);
    return NextResponse.json(
      { message: 'Failed to update child: ' + (error.message || String(error)) },
      { status: error.statusCode || 500 }
    );
  }
}