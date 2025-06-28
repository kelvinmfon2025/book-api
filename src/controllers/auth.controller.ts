import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import { User } from "../model/user.model";
import AppError from "../errors/AppError";
import { User as IUser } from "../interfaces/user.interface";
import {
  GenerateAccessToken,
  GenerateRefreshToken,
} from "../helpers/GenerateToken";
import { NODE_ENV, RefreshToken_Secret_Key } from "../../serviceUrl";
import GenerateRandomId, {
  generateRandomAlphanumeric,
} from "../helpers/GenerateRandomId";
import { logger } from "handlebars";
import sendMail from "../config/nodemailer.config";

export const registerHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password, phone, address, role } =
        req.body;

      // Validate required fields
      if (!firstName || !email || !password) {
        return next(
          new AppError("First name, email, and password are required", 400)
        );
      }

      // Check if user exists
      const userExists = await User.findOne({ email });

      if (userExists) {
        return next(new AppError("Email already exists", 400));
      }

      // Validate role
      const validRoles = ["member", "librarian", "admin"];
      if (role && !validRoles.includes(role)) {
        return next(
          new AppError("Invalid role. Must be member, librarian, or admin", 400)
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        firstName,
        lastName: lastName || "",
        email,
        password: hashedPassword,
        phone,
        address,
        role: role || "member", // Default to 'member' if not provided
        borrowedBooks: [],
      });

      const otpCode = generateRandomAlphanumeric();
      user.otp = otpCode;
      user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const mailOptions = {
        email,
        subject: "Verify Your Email Address",
        templateName: "verifyEmail",
        context: { name: firstName, otpCode },
      };

      await user.save();

      const maxRetries = 3;
      let attempts = 0;
      let emailSent = false;

      while (attempts < maxRetries && !emailSent) {
        try {
          await sendMail(mailOptions);
          emailSent = true;
        } catch (error) {
          attempts++;
          console.error(`Attempt ${attempts} failed:`, error);
          if (attempts >= maxRetries) {
            console.log(
              `Failed to send email to ${email} after ${maxRetries} attempts.`
            );
          }
        }
      }

      // Prepare response data
      // const account = {
      //   id: user._id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email,
      //   role: user.role,
      //   phone: user.phone,
      //   address: user.address,
      // };

      const account = { firstName, lastName, email, role, phone };

      return AppResponse(
        res,
        "Registration successful, please check email to verify.",
        201,
        account
      );
    } catch (error) {
      console.error("Error during registration:", error);
      return next(new AppError("Registration failed", 500));
    }
  }
);

export const verifyEmailHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { otp, email } = req.body as { otp: string; email: string };

            const findUser: any = await User.findOne({ email })
                .select("+password");

            if (!findUser) {
                return next(new AppError("User not found", 404));
            }

            const userDate = findUser.otpExpires;
            const dateToCheck = userDate ? new Date(userDate) : new Date(0);
            const now = new Date();

            if (findUser.otp === otp) {
                if (findUser.isEmailVerified) {
                    return next(
                        new AppError("This user has already verified their account.", 400)
                    );
                }

                // Check if current time is past the expiration time
                if (now > dateToCheck) {
                    return next(
                        new AppError("This OTP has expired. Please request a new one.", 400)
                    );
                } else {
                    findUser.isEmailVerified = true;
                    findUser.otp = "";
                    findUser.otpExpires = null;
                    await findUser.save();

                    // Send welcome email
                    await sendMail({
                        email: findUser.email,
                        subject: "Welcome to BookAPP!",
                        templateName: "welcome",
                        context: { name: findUser.name || "User" }, // Use name if available
                    }).catch((error: Error) =>
                        console.error("Failed to send welcome email:", error)
                    );

                    findUser.password = undefined;

                    const account = {
                        id: findUser._id,
                        firstName: findUser.firstName + " " + findUser.lastName,
                        email: findUser.email,
                        role: findUser.role,
                    };

                    const accessToken: string | undefined = GenerateAccessToken(account);
                    const refreshToken: string | undefined = GenerateRefreshToken(account);

                    return AppResponse(
                        res,
                        "User verification successful.",
                        200,
                        {
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            account: findUser,
                        }
                    );
                }
            }

            // Add this line to handle invalid OTP
            return next(new AppError("Invalid OTP code", 400));

        } catch (error) {
            console.error("Error during email verification:", error);
            return next(new AppError("Email verification failed", 500));
        }
    }
);


// // Resend Verification Email
// export const resendVerificationEmail = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { email } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) return next(new AppError("No user found with this email", 404));
//         if (user.isEmailVerified) return next(new AppError("User is already verified", 400));

//         const firstName = user.name.split(" ")[0];
//         const otpCode = generateRandomAlphanumeric();

//         const mailOptions = {
//             email: user.email,
//             subject: "Verify Your Email Address",
//             templateName: "verifyEmail",
//             context: { name: firstName, otpCode },
//         };

//         await user.save();

//         const maxRetries = 3;
//         let attempts = 0;
//         let emailSent = false;

//         while (attempts < maxRetries && !emailSent) {
//             try {
//                 await sendMail(mailOptions);
//                 emailSent = true;
//             } catch (error) {
//                 attempts++;
//                 console.error(`Attempt ${attempts} failed:`, error);
//                 if (attempts >= maxRetries) {
//                     return next(new AppError("Failed to send verification email", 500));
//                 }
//             }
//         }

//         return AppResponse(res, "Verification email resent successfully", 200, { email: user.email });
//     }
// );

// // Login Handler

export const loginHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   try {
     const isMobile = req.headers.mobilereqsender;
    const { email, password } = req.body;

    const user: IUser | null = await User.findOne({ email })
      .select("+password")

    if (!user) return next(new AppError("User not found", 404));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return next(new AppError("Invalid credentials", 401));
    if (!user.isEmailVerified)
      return next(new AppError("Please verify your email before log in.", 401));

    const account = {
      id: user._id,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role,
    };

    const accessToken = GenerateAccessToken(account);
    const refreshToken = GenerateRefreshToken(account);
    console.log("Tokens:", { accessToken, refreshToken });

    user.password = "";
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    if (isMobile)
      return AppResponse(res, "Login successful", 200, {
        accessToken,
        refreshToken,
        account: user,
      });

    res.cookie("e_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
      priority: "high",
      signed: true,
      maxAge: 60 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    res.cookie("e_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
      signed: true,
      priority: "high",
      maxAge: 60 * 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    return AppResponse(res, "Login successful", 200, {
      accessToken,
      refreshToken,
      account: user,
    });
    
   } catch (error) {
    console.error("Error during login:", error);
    return next(new AppError("Login failed", 500));
    
   }
  }
);

// chanegePasswordHandler
// This function will handle changing the user's password, validating the old password, and updating to a new password.
export const changePasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

//For Kazeem

// resetpasswordHandler
// This function will handle resetting the user's password using a reset token, validating the token, and updating the password.
export const resetPasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);



// export const forgotPasswordHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { email } = req.body;

//         // Find user by email
//         const user = await User.findOne({ email }).select("+otp +otpExpires");
//         if (!user) {
//             return next(new AppError("No user found with this email", 404));
//         }

//         // Generate 6-digit OTP
//         const otpCode = generateRandomAlphanumeric();
//         const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//         // Update user with OTP and expiration
//         user.otp = otpCode;
//         user.otpExpires = otpExpires;
//         await user.save();

//         // Prepare email
//         const firstName = user.name.split(" ")[0];
//         const mailOptions = {
//             email,
//             subject: "Reset Your Password",
//             templateName: "resetPassword",
//             context: { name: firstName, otpCode },
//         };

//         // Send email with retries
//         const maxRetries = 3;
//         let attempts = 0;
//         let emailSent = false;

//         while (attempts < maxRetries && !emailSent) {
//             try {
//                 await sendMail(mailOptions);
//                 emailSent = true;
//             } catch (error) {
//                 attempts++;
//                 console.error(`Attempt ${attempts} failed:`, error);
//                 if (attempts >= maxRetries) {
//                     return next(new AppError("Failed to send reset email", 500));
//                 }
//             }
//         }

//         return AppResponse(res, "OTP sent to your email for password reset", 200, { email });
//     }
// );

// export const resetPasswordHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { email, otp, newPassword } = req.body;

//         // Find user by email
//         const user: any = await User.findOne({ email }).select("+otp +otpExpires");
//         if (!user) {
//             return next(new AppError("No user found with this email", 404));
//         }

//         // Check OTP validity
//         if (user.otp !== otp) {
//             return next(new AppError("Invalid OTP", 400));
//         }

//         // Check OTP expiration
//         const now = new Date();
//         if (!user.otpExpires || now > user.otpExpires) {
//             return next(new AppError("OTP has expired", 400));
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update password and clear OTP
//         user.password = hashedPassword;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         await user.save();

//         return AppResponse(res, "Password reset successfully", 200, null);
//     }
// );

// export const changePasswordHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { currentPassword, newPassword } = req.body;
//         const userId = (req.user as IUser)._id;

//         // console.log("Change Password Request:", { userId, currentPassword, newPassword });

//         // Find user
//         const user = await User.findById(userId).select("+password");
//         if (!user) {
//             return next(new AppError("User not found", 404));
//         }

//         // Verify current password
//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return next(new AppError("Current password is incorrect", 401));
//         }

//         // Hash new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update password
//         user.password = hashedPassword;
//         await user.save();

//         return AppResponse(res, "Password changed successfully", 200, null);
//     }
// );

// export const verifyEmailHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const { otp, email } = req.body as { otp: string; email: string };

//             const findUser: any = await User.findOne({ email })
//                 .select("+password");

//             if (!findUser) {
//                 return next(new AppError("User not found", 404));
//             }

//             const userDate = findUser.otpExpires;
//             const dateToCheck = userDate ? new Date(userDate) : new Date(0);
//             const now = new Date();

//             if (findUser.otp === otp) {
//                 if (findUser.isEmailVerified) {
//                     return next(
//                         new AppError("This user has already verified their account.", 400)
//                     );
//                 }

//                 // Check if current time is past the expiration time
//                 if (now > dateToCheck) {
//                     return next(
//                         new AppError("This OTP has expired. Please request a new one.", 400)
//                     );
//                 } else {
//                     findUser.isEmailVerified = true;
//                     findUser.otp = "";
//                     findUser.otpExpires = null;
//                     await findUser.save();

//                     // Send welcome email
//                     await sendMail({
//                         email: findUser.email,
//                         subject: "Welcome to connectED!",
//                         templateName: "welcome",
//                         context: { name: findUser.name || "User" }, // Use name if available
//                     }).catch((error: Error) =>
//                         console.error("Failed to send welcome email:", error)
//                     );

//                     // Send push notification
//                     // if (findUser.fcm_token) {
//                     //     const message: admin.messaging.Message = {
//                     //         notification: {
//                     //             title: "Welcome to Arennah!",
//                     //             body: "Thank you for joining us!",
//                     //         },
//                     //         token: findUser.fcm_token,
//                     //     };
//                     //     await admin.messaging().send(message).catch((error: Error) =>
//                     //         console.error("Failed to send push notification:", error)
//                     //     );
//                     // }

//                     //remove password from the user object
//                     findUser.password = undefined;

//                     const account = {
//                         id: findUser._id,
//                         username: findUser.username,
//                         name: findUser.name,
//                         email: findUser.email,
//                         role: findUser.role,
//                     };

//                     const accessToken: string | undefined = GenerateAccessToken(account);
//                     const refreshToken: string | undefined = GenerateRefreshToken(account);

//                     return AppResponse(
//                         res,
//                         "User verification successful.",
//                         200,
//                         {
//                             accessToken: accessToken,
//                             refreshToken: refreshToken,
//                             account: findUser,
//                         }
//                     );
//                 }
//             }

//             // Add this line to handle invalid OTP
//             return next(new AppError("Invalid OTP code", 400));

//         } catch (error) {
//             console.error("Error during email verification:", error);
//             return next(new AppError("Email verification failed", 500));
//         }
//     }
// );

// //Completed

// export const logOutHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         //If Web
//         res.clearCookie("e_access_token");
//         res.clearCookie("e_refresh_token");
//         //If mobile, just tell them to delete on their storage
//         //   await addTokenToBlacklist(token);
//         return AppResponse(res, "User has Log out successfully", 200, null);
//     }
// );
// export const refreshAccessTokenHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {

//         if (!req.headers.authorization) {
//             return next(new AppError("No authorization header provided", 401));
//         }
//         const refreshToken = req.headers.authorization.split(" ")[1];

//         if (!refreshToken) return next(new AppError("No refresh token provided", 401));
//         jwt.verify(
//             refreshToken,
//             RefreshToken_Secret_Key as string,
//             async (err: any, decoded: any) => {
//                 if (err)
//                     return next(
//                         new AppError(
//                             "Incorrect or expired refresh token, please log in.",
//                             401
//                         )
//                     );

//                 const id = decoded.payload.id;
//                 const findUser = await User.findById(id).select("-password");

//                 if (!findUser)
//                     return next(
//                         new AppError(
//                             "Access token not created, only users can create them.",
//                             400
//                         )
//                     );
//                 const account = {
//                     id: findUser._id,
//                     name: findUser.name,
//                     email: findUser.email,
//                     role: findUser.role,
//                 };
//                 const accessToken: string | undefined = GenerateAccessToken(account);

//                 return AppResponse(res, "Token refreshed succesfully.", 200, {
//                     token: accessToken,
//                     account,
//                 });
//             }
//         );
//     }
// );

// //Completed
// export const GetTokenDetailsHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         // Logic for refreshing the access Token goes here
//         const id = (req.user as IUser).id;
//         const findUser = await User.findById(id);

//         if (!findUser)
//             return next(new AppError("Invalid user, please go off.", 400));
//         const account = {
//             id: findUser._id,
//             name: findUser.name,
//             email: findUser.email,
//             role: findUser.role,
//         };
//         return AppResponse(res, "Successfully verified the token", 200, account);
//     }
// );
