import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/services/EmailService';

const emailService = new EmailService();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, isApproved } = body;

    console.log('Toggle user approval request:', { userId, isApproved });

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get the user with their name and email for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isApproved: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user approval status
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isApproved: isApproved,
      },
    });

    // Send notification email based on approval status
    try {
      if (isApproved) {
        // Account approved - send approval email
        await emailService.sendApprovalEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`
        });
      } else {
        // Account unapproved - send unapproval email
        await emailService.sendAccountBlockedEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          reason: "not meeting service terms and conditions"
        });
      }
    } catch (emailError) {
      console.error('Email sending failed but user was updated:', emailError);
      // Continue execution - don't fail the operation just because email failed
    }

    return NextResponse.json({ 
      message: `User ${isApproved ? "approved" : "unapproved"} successfully`,
      user: {
        id: updatedUser.id,
        isApproved: updatedUser.isApproved
      }
    });
  } catch (error) {
    console.error('Failed to toggle user approval status:', error);
    return NextResponse.json(
      { message: 'Failed to toggle user approval status' },
      { status: 500 }
    );
  }
}