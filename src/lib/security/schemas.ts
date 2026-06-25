/**
 * Reusable zod schemas for client-side input validation.
 * Mirrors fields the app already accepts — purely defensive caps & shapes.
 *
 * These are opt-in. Existing forms keep working until callers import a schema.
 */
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128)
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), {
    message: "Use letters and numbers",
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(100, "Too long")
  .regex(/^[\p{L}\p{M}\s'.,-]+$/u, "Invalid characters");

export const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^[+0-9\s().-]+$/);

export const otpSchema = z.string().trim().regex(/^\d{4,8}$/);

export const journalEntrySchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(1).max(20_000),
  mood: z.string().trim().max(50).optional(),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1).max(4_000),
});

export const safeUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((u) => /^https:\/\//i.test(u), "Only https URLs are allowed");

export const profileSchema = z.object({
  full_name: fullNameSchema.optional(),
  bio: z.string().trim().max(1_000).optional(),
  location: z.string().trim().max(120).optional(),
  short_term_goals: z.string().trim().max(2_000).optional(),
  long_term_goals: z.string().trim().max(2_000).optional(),
  mobile_number: phoneSchema.optional(),
});

export const communityPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
});

export const inspirationStorySchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
  media_url: safeUrlSchema.optional(),
});
