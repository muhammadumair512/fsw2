import { prisma } from '@/lib/prisma';
import { Prisma, Payment } from '@prisma/client';

export async function findPaymentByUserId(userId: string) {
  return prisma.payment.findUnique({
    where: {
      userId,
    },
  });
}


export async function createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
  return prisma.payment.create({
    data,
  });
}

export async function updatePayment(
  userId: string,
  data: Prisma.PaymentUpdateInput
): Promise<Payment> {
  return prisma.payment.update({
    where: {
      userId,
    },
    data,
  });
}

export async function upsertPayment(
  userId: string,
  data: Prisma.PaymentUncheckedUpdateInput
): Promise<Payment> {
  
  const existingPayment = await findPaymentByUserId(userId);
  
  if (existingPayment) {
    
    return updatePayment(userId, data);
  } else {
    
    return createPayment({
      ...data as Prisma.PaymentCreateInput,
      user: { connect: { id: userId } },
      agreedToTerms: true, 
    });
  }
}