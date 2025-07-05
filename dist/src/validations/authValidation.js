"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.twoFASchema = exports.verifyOtpSchema = exports.CreateOtpSchema = exports.loginSchema = exports.VerifyOtpSchema = exports.verifyEmailOtpSchema = exports.registerSchema = void 0;
//All validation for auth to be done here
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z
        .string({ required_error: 'First name is required' })
        .min(3, 'First name must be at least 3 characters long')
        .trim(),
    lastName: zod_1.z
        .string()
        .max(50, 'Last name must not exceed 50 characters')
        .trim()
        .optional(),
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: zod_1.z
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
    phone: zod_1.z
        .string()
        .regex(/^\d+$/, 'Phone number must contain only digits')
        .min(7, 'Phone number must be at least 7 digits')
        .max(15, 'Phone number must not exceed 15 digits')
        .trim()
        .optional(),
    address: zod_1.z
        .string()
        .max(200, 'Address must not exceed 200 characters')
        .trim()
        .optional(),
    role: zod_1.z
        .enum(['member', 'librarian', 'admin'])
        .default('member')
        .refine((value) => ['member', 'librarian', 'admin'].includes(value), {
        message: "Role must be either 'member', 'librarian', or 'admin'",
    }),
});
exports.verifyEmailOtpSchema = zod_1.z.object({
    otp: zod_1.z
        .string({ required_error: "OTP is required" })
        .min(6, "OTP must not be less than six characters")
        .max(6, "OTP must not exceed six characters"),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
});
exports.VerifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        otp: zod_1.z.string().min(6, "OTP must be 6 characters").max(6, "OTP must be 6 characters"),
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: zod_1.z
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
exports.CreateOtpSchema = zod_1.z.object({
    phone_number: zod_1.z
        .string({ required_error: "Phone number is required" })
        .min(8, "Phone number must be at least 8 characters long")
        .refine((val) => /^234\d{10,}$/.test(val), {
        message: "Phone number must start with '234' and be followed by at least 10 digits",
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    otp: zod_1.z
        .string({ required_error: "OTP is required" })
        .min(4, "OTP must not be less than four characters")
        .max(4, "OTP must not exceed four characters"),
});
exports.twoFASchema = zod_1.z.object({
    two_factor_code: zod_1.z
        .string({ required_error: "OTP is required" })
        .min(4, "OTP must not be less than four characters")
        .max(9, "OTP must not exceed nine characters"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
    otp: zod_1.z
        .string({ required_error: "OTP is required" })
        .min(6, "OTP must not be less than six characters"),
    newPassword: zod_1.z
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
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z
        .string().min(6, "Current password must be at least 6 characters"),
    newPassword: zod_1.z
        .string().min(6, "New password must be at least 6 characters"),
});
