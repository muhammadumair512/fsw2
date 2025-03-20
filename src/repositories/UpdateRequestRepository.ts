import { prisma } from '@/lib/prisma';
import { Prisma, UpdateRequest } from '@prisma/client';

/**
 * Find update request by ID
 */
export async function findUpdateRequestById(id: string) {
  return prisma.updateRequest.findUnique({
    where: { id },
  });
}

/**
 * Find update request by ID with user details
 */
export async function findUpdateRequestWithUser(id: string) {
  return prisma.updateRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

/**
 * Get all update requests for a user
 */
export async function findUpdateRequestsByUserId(userId: string) {
  return prisma.updateRequest.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all update requests (for admin)
 */
export async function getAllUpdateRequests() {
  return prisma.updateRequest.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Create a new update request
 */
export async function createUpdateRequest(
  data: Prisma.UpdateRequestUncheckedCreateInput
): Promise<UpdateRequest> {
  return prisma.updateRequest.create({
    data,
  });
}

/**
 * Update the status of an update request
 */
export async function updateRequestStatus(
  id: string,
  status: string,
  adminComment?: string
): Promise<UpdateRequest> {
  return prisma.updateRequest.update({
    where: { id },
    data: {
      status,
      adminComment,
    },
  });
}