import { prisma } from '@/lib/prisma';
import { Prisma,  Child } from '@prisma/client';

export async function findChildById(id: string) {
  return prisma.child.findUnique({
    where: { id },
  });
}


export async function findChildByIdAndUserId(id: string, userId: string) {
  return prisma.child.findFirst({
    where: {
      id,
      userId,
    },
  });
}


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


export async function createChild(data: Prisma.ChildCreateInput): Promise<Child> {
  return prisma.child.create({
    data,
  });
}


export async function updateChild(
  id: string,
  data: Prisma.ChildUpdateInput
): Promise<Child> {
  return prisma.child.update({
    where: { id },
    data,
  });
}

export async function deleteChild(id: string): Promise<Child> {
  return prisma.child.delete({
    where: { id },
  });
}