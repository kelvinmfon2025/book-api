import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import { User } from "../model/user.model";
import AppError from "../errors/AppError";
import { IUser } from "../interfaces/user.interface";
import checkRole from "../middleware/checkRole";

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
    return AppResponse(res, "User profile retrieved successfully", 201, user);
  }
);







//I did this one my self  :Kelvin
//This controller is working fine
//--------------------------------------------------------------------------------------------------------------------------------------------


// This controller handles updating the user profile
// It allows users to update their profile information while preventing changes to sensitive fields like password, role, createdAt, and updatedAt

export const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user._id) {
      return next(new AppError("User not authenticated", 401));
    }

    const userId = req.user._id;

    // Prevent updates to restricted fields
    const disallowedFields = ["password", "role", "createdAt", "updatedAt"];
    const updates: Partial<Record<string, any>> = {};

    for (const key in req.body) {
      if (!disallowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    return AppResponse(
      res,
      "User profile updated successfully",
      200,
      updatedUser
    );
  }
);

// Kelvin

//This is where i started writing from




//This one is also working fine
//----------------------------------------------------------------------------------------------------------------------------------------------



// This controller retrieves a user by their ID
// It checks if the requester is an admin or librarian before allowing access
// If the user is found, it returns the user details excluding the password
// If the user is not found, it returns an error
export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Ensure user is authenticated and authorized
    const requesterRole = req.user?.role;

    if (!["admin", "librarian"].includes(requesterRole)) {
      return next(new AppError("Access denied", 403));
    }

    // Find the user by ID, excluding the password
    const user = await User.findById(id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    return AppResponse(
      res,
      "User details retrieved successfully",
      200,
      user
    );
  }
);







// This also works fine
//----------------------------------------------------------------------------------------------------------------------------------------------




// This controller updates a user by their ID
// It allows only admins to update user details
// It prevents updating sensitive fields like password, email, and _id
// If the user is found and updated, it returns the updated user details

export const updateUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Only admins are allowed
    if (req.user?.role !== "admin") {
      return next(new AppError("Access denied: Admins only", 403));
    }

    const updates = req.body;

    // Prevent updating sensitive fields (optional safeguard)
    delete updates.password;
    delete updates.email;
    delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    return AppResponse(res, "User updated successfully", 200, updatedUser);
  }
);










// I have not done the route for deleting a user by their ID yet

// This controller deletes a user by their ID
// It allows only admins to delete users
// If the user is found and deleted, it returns a success message
export const deleteUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Only admins are allowed
    if (req.user?.role !== "admin") {
      return next(new AppError("Access denied: Admins only", 403));
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return next(new AppError("User not found", 404));
    }

    return AppResponse(res, "User deleted successfully", 200, deletedUser);
  }
);