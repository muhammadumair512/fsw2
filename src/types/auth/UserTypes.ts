import { z } from 'zod';

// Child schema
export const childSchema = z.object({
  firstName: z.string().min(1, "Child's first name is required"),
  lastName: z.string().min(1, "Child's last name is required"),
  age: z.number().int().positive("Age must be a positive number"),
  specialNotes: z.string().optional(),
});

// Services schema
export const servicesSchema = z.object({
  childcare: z.boolean().default(false),
  mealPreparation: z.boolean().default(false),
  lightHousekeeping: z.boolean().default(false),
  tutoring: z.boolean().default(false),
  petMinding: z.boolean().default(false),
});

// Payment schema
export const paymentSchema = z.object({
  nameOnCard: z.string().min(1, "Name on card is required"),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits"),
  saveCard: z.boolean().default(false),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});

// Registration schema
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
  additionalInfo: z.string().optional(),
  children: z.array(childSchema).min(1, "At least one child is required"),
  services: servicesSchema,
  payment: paymentSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Types based on schemas
export type UserRegistrationData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type ChildData = z.infer<typeof childSchema>;
export type ServicesData = z.infer<typeof servicesSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;