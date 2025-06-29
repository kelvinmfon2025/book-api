import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Exclude password by default in queries
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d+.*/, "Please provide a valid phone number"],
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["member", "admin", "librarian"],
      default: "member",
      required: true,
    },
    borrowedBooks: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: "Book", // Reference to Book model
          required: true,
        },
        borrowDate: {
          type: Date,
          required: true,
        },
        dueDate: {
          type: Date,
          required: true,
        },
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String }, // OTP for email verification
    otpExpires: { type: Date },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
