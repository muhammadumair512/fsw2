import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
export async function GET(
  _request: Request,
  context: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = context.params.userId;
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        additionalInfo: true,
        isApproved: true,
        isActive: true,
        createdAt: true,
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            age: true,
            specialNotes: true,
          },
        },
        services: {
          select: {
            childcare: true,
            mealPreparation: true,
            lightHousekeeping: true,
            tutoring: true,
            petMinding: true,
          },
        },
        paymentInfo: {
          select: {
            id: true,
            nameOnCard: true,
            cardNumber: true,
            expiryDate: true,
            cvv: true,
            saveCard: true,
          }
        }
      },
    });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}