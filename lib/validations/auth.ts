import { z } from "zod";

/**
 * Password validation utility
 * Enforces strong password requirements for user authentication
 * Requirements: 1.3 - Password must have 8+ characters, uppercase, lowercase, number, and special character
 */

/**
 * Password strength validation function
 * Validates that password meets all security requirements
 * 
 * @param password - Password string to validate
 * @returns true if password meets all requirements, false otherwise
 */
export const validatePasswordStrength = (password: string): boolean => {
  // Minimum 8 characters
  if (password.length < 8) {
    return false;
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // At least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }

  return true;
};

/**
 * Get detailed password validation errors
 * Returns an array of specific validation failures
 * 
 * @param password - Password string to validate
 * @returns Array of error messages, empty if valid
 */
export const getPasswordValidationErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

/**
 * Zod schema for password validation
 * Used in forms and API validation
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /\d/.test(password),
    "Password must contain at least one number"
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    "Password must contain at least one special character"
  );

/**
 * Email validation utility
 * Validates email format according to RFC 5322 simplified pattern
 * Requirements: 1.1, 4.3 - Valid email format with max 255 characters
 */

/**
 * Email format validation function
 * 
 * @param email - Email string to validate
 * @returns true if email format is valid, false otherwise
 */
export const validateEmailFormat = (email: string): boolean => {
  // RFC 5322 simplified email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check format and length
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Zod schema for email validation
 * Used in forms and API validation
 */
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .max(255, "Email must not exceed 255 characters")
  .toLowerCase()
  .trim();

/**
 * Zod schema for user registration
 * Combines email and password validation with optional profile fields
 */
export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces")
    .optional(),
  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian phone number starting with 6-9")
    .optional(),
});

/**
 * Type for user registration data
 */
export type RegisterUserData = z.infer<typeof registerUserSchema>;

/**
 * Zod schema for user login
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Type for user login data
 */
export type LoginUserData = z.infer<typeof loginUserSchema>;

/**
 * Zod schema for password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Type for password reset request
 */
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;

/**
 * Zod schema for password reset with token
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
});

/**
 * Type for password reset data
 */
export type PasswordResetData = z.infer<typeof passwordResetSchema>;

/**
 * Zod schema for password change (requires current password)
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/**
 * Type for password change data
 */
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
