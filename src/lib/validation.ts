import { z } from "zod";

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export const depositSchema = z.object({
  transactionHash: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{64}$/, { message: "Invalid transaction hash format" }),
});

export const withdrawSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Amount must be positive" })
    .max(1000000, { message: "Amount exceeds maximum limit" }),
  walletAddress: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid wallet address" }),
});

export const adminCreditSchema = z.object({
  walletAddress: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/, { message: "Invalid wallet address" }),
  amount: z
    .number()
    .positive({ message: "Amount must be positive" })
    .max(100000, { message: "Cannot credit more than 100,000 tokens at once" }),
});
