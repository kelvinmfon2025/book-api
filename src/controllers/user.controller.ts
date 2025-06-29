import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import { User } from "../model/user.model";
import AppError from "../errors/AppError";
import {  IUser } from "../interfaces/user.interface";

// Extend Express Request interface to include 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
      [key: string]: any;
    };
  }
}

// This controller handles user profile retrieval
// It fetches the user's profile information from the database and returns it in the response

export const getUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
      return next(new AppError("User not authenticated", 401));
    }
    const userId = req.user._id;

    // Fetch user profile from the database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Return user profile
    return AppResponse(res, "User profile retrieved successfully", 201,  user);
  }
);

export const editUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {  


  }
);