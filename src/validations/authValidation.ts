//All validation for auth to be done here
import { z } from "zod";


export const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(3, 'First name must be at least 3 characters long')
    .trim(),
  lastName: z
    .string()
    .max(50, 'Last name must not exceed 50 characters')
    .trim()
    .optional(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /\d/.test(val), {
      message: 'Password must contain at least one digit',
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: 'Password must contain at least one special character',
    }),
  phone: z
    .string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .min(7, 'Phone number must be at least 7 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .trim()
    .optional(),
  address: z
    .string()
    .max(200, 'Address must not exceed 200 characters')
    .trim()
    .optional(),
  role: z
    .enum(['member', 'librarian', 'admin'])
    .default('member')
    .refine((value) => ['member', 'librarian', 'admin'].includes(value), {
      message: "Role must be either 'member', 'librarian', or 'admin'",
    }),
});
export const verifyEmailOtpSchema = z.object({
  otp: z
    .string({ required_error: "OTP is required" })
    .min(6, "OTP must not be less than six characters")
    .max(6, "OTP must not exceed six characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
});

export const VerifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(6, "OTP must be 6 characters").max(6, "OTP must be 6 characters"),
  }),
});


export const loginSchema = z.object({
  phone_email_or_username: z
    .string({ required_error: "Email, Username or phone number is required" })
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\d{13}$/.test(val),
      {
        message: "Must be a valid username, email or an 11-digit phone number",
      }
    ),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one digit",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character.",
    }),
});

export const CreateOtpSchema = z.object({
  phone_number: z
    .string({ required_error: "Phone number is required" })
    .min(8, "Phone number must be at least 8 characters long")
    .refine((val) => /^234\d{10,}$/.test(val), {
      message:
        "Phone number must start with '234' and be followed by at least 10 digits",
    }),
});
export const verifyOtpSchema = z.object({
  otp: z
    .string({ required_error: "OTP is required" })
    .min(4, "OTP must not be less than four characters")
    .max(4, "OTP must not exceed four characters"),
});
export const twoFASchema = z.object({
  two_factor_code: z
    .string({ required_error: "OTP is required" })
    .min(4, "OTP must not be less than four characters")
    .max(9, "OTP must not exceed nine characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
});

export const resetPasswordSchema = z.object({

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
  otp: z
    .string({ required_error: "OTP is required" })
    .min(6, "OTP must not be less than six characters"),
  newPassword: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one digit",
    })

});

export const changePasswordSchema = z.object({

  currentPassword: z
    .string().min(6, "Current password must be at least 6 characters"),
  newPassword: z
    .string().min(6, "New password must be at least 6 characters"),
    
});