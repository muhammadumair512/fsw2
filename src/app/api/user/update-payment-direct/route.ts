import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { updatePaymentInfo } from '@/services/PaymentService';

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
    await updatePaymentInfo(session.user.id, data);

    return NextResponse.json({ message: 'Payment information updated successfully' });
  } catch (error: any) {
    console.error('Failed to update payment information:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update payment information' },
      { status: error.statusCode || 500 }
    );
  }
}