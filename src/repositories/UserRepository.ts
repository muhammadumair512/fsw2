import { prisma } from '@/lib/prisma';
import { Prisma, User } from '@prisma/client';
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({
    data,
  });
}
export async function updateUserProfile(
  userId: string,
  data: Prisma.UserUpdateInput
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
export async function updatePassword(
  userId: string,
  hashedPassword: string,
  resetTokenId?: string
) {
  const updateData: Prisma.UserUpdateInput = {
    password: hashedPassword,
  };
  if (resetTokenId) {
    updateData.resetToken = null;
    updateData.resetTokenExpiry = null;
  }
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}
export async function toggleUserApproval(userId: string, isApproved: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isApproved },
  });
}
export async function toggleUserActiveStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}
export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      isAdmin: false,
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
                gte: new Date(new Date().setDate(new Date().getDate() - 7))
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