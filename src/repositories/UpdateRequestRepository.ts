import { prisma } from '@/lib/prisma';
import { Prisma, UpdateRequest } from '@prisma/client';
export async function findUpdateRequestById(id: string) {
  return prisma.updateRequest.findUnique({
    where: { id },
  });
}
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
export async function createUpdateRequest(
  data: Prisma.UpdateRequestUncheckedCreateInput
): Promise<UpdateRequest> {
  return prisma.updateRequest.create({
    data,
  });
}
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