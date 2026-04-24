import { z } from "zod";

export const loginSchema = z.object({
	username: z.string().min(1, "Username is required").max(50),
	password: z.string().min(1, "Password is required").max(200),
});

export const createUserSchema = z.object({
	company_id: z.uuid("Invalid company ID"),
	username: z.string().min(3, "Username must be at least 3 characters").max(50),
	password: z.string().min(6, "Password must be at least 6 characters").max(100),
	role: z.number().int().min(0).max(99).default(0),
});

export const updateUsernameSchema = z.object({
	newUsername: z.string().min(3, "Username must be at least 3 characters").max(50),
	currentPassword: z.string().min(1, "Current password is required"),
});

export const updatePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(6, "New password must be at least 6 characters").max(100),
});
