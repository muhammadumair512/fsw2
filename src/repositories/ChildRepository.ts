import { prisma } from '@/lib/prisma';
import { Prisma, Child } from '@prisma/client';

/**
 * Find a child by ID
 */
export async function findChildById(id: string) {
  return prisma.child.findUnique({
    where: { id },
  });
}

/**
 * Find a child by ID and user ID
 * This is used to verify ownership
 */
export async function findChildByIdAndUserId(id: string, userId: string) {
  return prisma.child.findFirst({
    where: {
      id,
      userId,
    },
  });
}

/**
 * Get all children for a user
 */
export async function getChildrenByUserId(userId: string) {
  return prisma.child.findMany({
    where: {
      userId,
    },
    orderBy: {
      firstName: 'asc',
    },
  });
}

/**
 * Create a new child
 */
export async function createChild(data: Prisma.ChildCreateInput): Promise<Child> {
  return prisma.child.create({
    data,
  });
}

/**
 * Update a child's information
 */
export async function updateChild(
  id: string,
  data: Prisma.ChildUpdateInput
): Promise<Child> {
  return prisma.child.update({
    where: { id },
    data,
  });
}

/**
 * Delete a child
 */
export async function deleteChild(id: string): Promise<Child> {
  return prisma.child.delete({
    where: { id },
  });
}