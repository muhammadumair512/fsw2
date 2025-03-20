import { prisma } from '@/lib/prisma';
import { Prisma, Payment } from '@prisma/client';

/**
 * Find payment information for a user
 */
export async function findPaymentByUserId(userId: string) {
  return prisma.payment.findUnique({
    where: {
      userId,
    },
  });
}

/**
 * Create new payment information for a user
 */
export async function createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
  return prisma.payment.create({
    data,
  });
}

/**
 * Update payment information for a user
 */
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

/**
 * Create or update payment information for a user
 * This is helpful when we're not sure if the user already has payment info
 */
export async function upsertPayment(
  userId: string,
  data: Prisma.PaymentUncheckedUpdateInput
): Promise<Payment> {
  // First, check if payment info exists for the user
  const existingPayment = await findPaymentByUserId(userId);
  
  if (existingPayment) {
    // Update existing payment info
    return updatePayment(userId, data);
  } else {
    // Create new payment info
    return createPayment({
      ...data as Prisma.PaymentCreateInput,
      user: { connect: { id: userId } },
      agreedToTerms: true, // Default value
    });
  }
}