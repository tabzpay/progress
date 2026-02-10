import { z } from "zod";

/**
 * Shared regular expressions
 */
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

/**
 * Loan Schema - for creating and editing loans
 */
export const LoanSchema = z.object({
    borrower_name: z
        .string()
        .min(2, "Borrower name must be at least 2 characters")
        .max(50, "Name is too long"),
    amount: z.coerce
        .number()
        .positive("Amount must be greater than zero"),
    currency: z.string().min(1, "Currency is required"),
    due_date: z.string().min(1, "Due date is required"),
    note: z.string().max(200, "Note must be under 200 characters").optional(),
    type: z.enum(["personal", "business", "group"]).default("personal"),
    reminder_frequency: z.enum(["none", "weekly", "monthly"]).default("none"),
});

export type LoanFormData = z.infer<typeof LoanSchema>;

/**
 * Registration Schema
 */
export const RegisterSchema = z.object({
    full_name: z
        .string()
        .min(3, "Full name must be at least 3 characters")
        .max(50, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    phone: z.string().optional(),
    intent: z.enum(["lend", "borrow", "explore"]).optional(),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

/**
 * Login Schema
 */
export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

/**
 * Profile Schema
 */
export const ProfileSchema = z.object({
    full_name: z.string().min(3, "Full name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    avatar_url: z.string().url("Invalid URL").optional().nullable(),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;

/**
 * Payment Schema - for recording repayments
 */
export const PaymentSchema = z.object({
    amount: z.coerce
        .number()
        .positive("Amount must be greater than zero"),
    note: z.string().max(200, "Note must be under 200 characters").optional(),
});

export type PaymentFormData = z.infer<typeof PaymentSchema>;

/**
 * Forgot Password Schema
 */
export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;
