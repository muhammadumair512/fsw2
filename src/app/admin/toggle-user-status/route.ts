import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/services/EmailService';

// Simplified direct implementation to bypass potential issues
export async function POST(request: Request) {
  try {
    // Skip session check for now to diagnose the issue
    const body = await request.json();
    const { userId, isActive } = body;

    console.log('Toggle user status request:', { userId, isActive });

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Directly query the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user directly
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // Send email if enabled
    try {
      const emailService = new EmailService();
      
      if (!isActive) {
        await emailService.sendAccountBlockedEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          reason: "not meeting service terms and conditions"
        });
      } else {
        await emailService.sendAccountActivatedEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
      }
    } catch (emailError) {
      console.error('Email sending failed but user was updated:', emailError);
    }

    return NextResponse.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }
    });
  } catch (error: any) {
    console.error('Failed to toggle user status:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to toggle user status' },
      { status: error.statusCode || 500 }
    );
  }
}