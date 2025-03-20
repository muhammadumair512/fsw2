import { prisma } from '@/lib/prisma';
import { Prisma, User } from '@prisma/client';

/**
 * Find a user by their ID
 */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Find a user by their email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Create a new user
 */
export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({
    data,
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Prisma.UserUpdateInput
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Update user password
 */
export async function updatePassword(
  userId: string,
  hashedPassword: string,
  resetTokenId?: string
) {
  const updateData: Prisma.UserUpdateInput = {
    password: hashedPassword,
  };

  // If a reset token ID is provided, clear it
  if (resetTokenId) {
    updateData.resetToken = null;
    updateData.resetTokenExpiry = null;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}

/**
 * Toggle user approval status
 */
export async function toggleUserApproval(userId: string, isApproved: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isApproved },
  });
}

/**
 * Toggle user active status
 */
export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      isAdmin: false, // Don't show admin users
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get user details by ID (for admin)
 */
export async function getUserDetailsById(userId: string) {
  return prisma.user.findUnique({
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
}

/**
 * Get user profile (for dashboard)
 */
export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
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
      },
      updateRequests: {
        where: {
          OR: [
            { status: "PENDING" },
            { 
              status: { in: ["APPROVED", "REJECTED"] },
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
              }
            }
          ]
        },
        select: {
          id: true,
          requestType: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}