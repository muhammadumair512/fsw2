import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/services/EmailService';

// Simple direct update route with no auth checks
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, field, value } = body;
    
    if (!userId || !field) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate the field name to prevent injection
    if (!['isApproved', 'isActive'].includes(field)) {
      return NextResponse.json({ message: 'Invalid field name' }, { status: 400 });
    }
    
    // Get the user first to check existence and gather info for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isApproved: true,
        isActive: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Dynamically create the update data
    const updateData = {
      [field]: value
    };
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    // Send appropriate email based on the update
    try {
      const emailService = new EmailService();
      
      if (field === 'isApproved') {
        if (value === true) {
          await emailService.sendApprovalEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`
          });
        } else {
          await emailService.sendAccountBlockedEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`,
            reason: "not meeting service terms and conditions"
          });
        }
      } else if (field === 'isActive') {
        if (value === true) {
          await emailService.sendAccountActivatedEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`
          });
        } else {
          await emailService.sendAccountBlockedEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`,
            reason: "not meeting service terms and conditions"
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send email but user was updated:', emailError);
    }
    
    return NextResponse.json({
      message: `User ${field} updated successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in direct-update:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}