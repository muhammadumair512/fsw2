import { z } from 'zod';

// Schema for payment update
export const paymentUpdateSchema = z.object({
  nameOnCard: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits"),
  saveCard: z.boolean().default(false),
});

// Schema for creating new payment info
export const paymentCreateSchema = z.object({
  nameOnCard: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits"),
  saveCard: z.boolean().default(false),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});

// Types based on schemas
export type PaymentData = z.infer<typeof paymentUpdateSchema>;
export type NewPaymentData = z.infer<typeof paymentCreateSchema>;