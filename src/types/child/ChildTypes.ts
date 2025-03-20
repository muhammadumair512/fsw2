import { z } from 'zod';

// Schema for child update
export const childUpdateSchema = z.object({
  id: z.string().min(1, "Child ID is required"),
  firstName: z.string().min(1, "Child's first name is required"),
  lastName: z.string().min(1, "Child's last name is required"),
  age: z.number().int().positive("Age must be a positive number"),
  specialNotes: z.string().optional(),
});

// Schema for adding a new child
export const childAddSchema = z.object({
  firstName: z.string().min(1, "Child's first name is required"),
  lastName: z.string().min(1, "Child's last name is required"),
  age: z.number().int().positive("Age must be a positive number"),
  specialNotes: z.string().optional(),
});

// Types based on schemas
export type ChildData = z.infer<typeof childUpdateSchema>;
export type NewChildData = z.infer<typeof childAddSchema>;