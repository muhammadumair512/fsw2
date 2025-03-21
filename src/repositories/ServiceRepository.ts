import { prisma } from '@/lib/prisma';
import { Prisma, Service } from '@prisma/client';

export async function findServicesByUserId(userId: string) {
  return prisma.service.findUnique({
    where: {
      userId,
    },
  });
}

export async function createServices(data: Prisma.ServiceCreateInput): Promise<Service> {
  return prisma.service.create({
    data,
  });
}

export async function updateServices(
  userId: string,
  data: Prisma.ServiceUpdateInput
): Promise<Service> {
  return prisma.service.update({
    where: {
      userId,
    },
    data,
  });
}

export async function upsertServices(
  userId: string,
  data: Prisma.ServiceUpdateInput
): Promise<Service> {
  // First, check if services exist for the user
  const existingServices = await findServicesByUserId(userId);
  
  if (existingServices) {
    // Update existing services
    return updateServices(userId, data);
  } else {
    // Create new services
    return createServices({
      ...data as Prisma.ServiceCreateInput,
      user: { connect: { id: userId } }
    });
  }
}