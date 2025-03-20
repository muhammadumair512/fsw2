import { z } from 'zod';

// Schema for service update
export const serviceUpdateSchema = z.object({
  childcare: z.boolean().default(false),
  mealPreparation: z.boolean().default(false),
  lightHousekeeping: z.boolean().default(false),
  tutoring: z.boolean().default(false),
  petMinding: z.boolean().default(false),
});

// Types based on schemas
export type ServiceData = z.infer<typeof serviceUpdateSchema>;