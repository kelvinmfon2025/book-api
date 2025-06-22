import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import { Student, Mentor, Recruiter, Freelancer, User } from "../models/user.model"
import AppError from "../errors/AppError";
import { IUser } from "../interfaces/IUser";
import sendMail from "../config/nodemailer.config";
import { GenerateAccessToken, GenerateRefreshToken } from "../helpers/GenerateToken";
import { NODE_ENV, RefreshToken_Secret_Key } from "../serviceUrl";
import GenerateRandomId, { generateRandomAlphanumeric } from "../helpers/GenerateRandomId";
import { logger } from "handlebars";

// Register Handler
export const registerHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { role, name, username, email, password, country, phone } = req.body;

            const userExists = await User.findOne({ email, username });

            if (userExists) {
                return next(new AppError("User already exists", 400));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            let user: any;
            switch (role) {
                case "student":
                    user = new Student({ name, email, username, role, password: hashedPassword, experienceLevel: "beginner" });
                    break;
                case "mentor":
                    user = new Mentor({ name, email, username, role, password: hashedPassword, availability: "1 hr/week", experienceLevel: "intermediate" });
                    break;
                case "recruiter":
                    user = new Recruiter({ name, email, username, role, password: hashedPassword });
                    break;
                case "freelancer":
                    user = new Freelancer({ name, email, username,  role, password: hashedPassword, experienceLevel: "beginner" });
                    break;
                default:
                    return next(new AppError("Invalid role. Must be student, mentor, recruiter, or freelancer", 400));
            }

            const firstName = name.split(" ")[0];
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
                        console.log(`Failed to send email to ${email} after ${maxRetries} attempts.`);
                    }
                }
            }

            const account = { name, username,  email, role, country, phone };
            return AppResponse(res, "Registration successful, please check email to verify.", 201, account);
            
        } catch (error) {
            console.error("Error during registration:", error);
            return next(new AppError("Registration failed", 500));
            
        }
    }
);

// Resend Verification Email
export const resendVerificationEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return next(new AppError("No user found with this email", 404));
        if (user.isEmailVerified) return next(new AppError("User is already verified", 400));

        const firstName = user.name.split(" ")[0];
        const otpCode = generateRandomAlphanumeric();

        const mailOptions = {
            email: user.email,
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
                    return next(new AppError("Failed to send verification email", 500));
                }
            }
        }

        return AppResponse(res, "Verification email resent successfully", 200, { email: user.email });
    }
);

// Login Handler

export const loginHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const isMobile = req.headers.mobilereqsender;
        const { phone_email_or_username, password } = req.body;
        console.log("Login Request:", { phone_email_or_username, password });

        const user: any = await User.findOne({
            $or: [{ email: phone_email_or_username }, { phone_number: phone_email_or_username }, { username: phone_email_or_username }],
        })
            .select("+password")
            .populate("store");

        console.log("User Found:", user ? user.email : "No user");
        if (!user) return next(new AppError("User not found", 404));

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isMatch);
        if (!isMatch) return next(new AppError("Invalid credentials", 401));
        if (!user.isEmailVerified)
            return next(new AppError("Please verify your email before log in.", 401));

        const account = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        };
        console.log("Account:", account);

        const accessToken = GenerateAccessToken(account);
        const refreshToken = GenerateRefreshToken(account);
        console.log("Tokens:", { accessToken, refreshToken });

        user.password = undefined;
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
    }
);

// export const loginHandler = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const isMobile = req.headers.mobilereqsender;

//         const { phone_email_or_username, password } = req.body;
//         // const user = await User.findOne({ email });
//         const user: any = await User.findOne({
//             $or: [{ email: phone_email_or_username }, { phone_number: phone_email_or_username }, { username: phone_email_or_username }], 
//         })
//             .select("+password")
//             .populate("store");

//         if (!user) return next(new AppError("User not found", 404));

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return next(new AppError("Invalid credentials", 401));
//         if (!user.isEmailVerified)
//             return next(new AppError("Please verify your email before log in.", 401));
//         // if (user.is_two_factor_enabled) {
//         //     //We should send a token here to track that okay, this person has had their password stuff done
//         //     const two_fa_track = {
//         //         id: user._id,
//         //         createdAt: Date.now(),
//         //     };
//         //     const two_fa_token = GenerateTrackingToken(two_fa_track);
//         //     return AppResponse(
//         //         res,
//         //         "Please check your Authenticator app for your token.",
//         //         200,
//         //         two_fa_token
//         //     );
//         // }
//         const account = {
//             id: user._id,
//             name: user.name,
//             username: user.username,
//             email: user.email,
//             // phone_number: user.phone_number,
//             role: user.role,
//             // profile_image:user.imageUrl,
//         };

//         // remove password from the user object
//         user.password = undefined;

//         await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
//         const accessToken: string | undefined = GenerateAccessToken(account);
//         const refreshToken: string | undefined = GenerateRefreshToken(account);
//         //If it is mobile we send token in response

//         if (isMobile)
//             return AppResponse(res, "Login successful", 200, {
//                 accessToken: accessToken,
//                 refreshToken: refreshToken,
//                 account: user,
//             });

//         res.cookie("e_access_token", accessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "none",
//             partitioned: true,
//             priority: "high",
//             signed: true,
//             maxAge: 60 * 24 * 60 * 60 * 1000,
//             expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
//         });

//         res.cookie("e_refresh_token", refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "none",
//             partitioned: true,
//             signed: true,
//             priority: "high",
//             maxAge: 60 * 24 * 60 * 60 * 1000,
//             expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
//         });


//         return AppResponse(res, "Login successful", 200, {
//             accessToken: accessToken,
//             refreshToken: refreshToken,
//             account: user,
//         });
//     }
// );

export const forgotPasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select("+otp +otpExpires");
        if (!user) {
            return next(new AppError("No user found with this email", 404));
        }

        // Generate 6-digit OTP
        const otpCode = generateRandomAlphanumeric();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with OTP and expiration
        user.otp = otpCode;
        user.otpExpires = otpExpires;
        await user.save();

        // Prepare email
        const firstName = user.name.split(" ")[0];
        const mailOptions = {
            email,
            subject: "Reset Your Password",
            templateName: "resetPassword",
            context: { name: firstName, otpCode },
        };

        // Send email with retries
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
                    return next(new AppError("Failed to send reset email", 500));
                }
            }
        }

        return AppResponse(res, "OTP sent to your email for password reset", 200, { email });
    }
);

export const resetPasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp, newPassword } = req.body;

        // Find user by email
        const user: any = await User.findOne({ email }).select("+otp +otpExpires");
        if (!user) {
            return next(new AppError("No user found with this email", 404));
        }

        // Check OTP validity
        if (user.otp !== otp) {
            return next(new AppError("Invalid OTP", 400));
        }

        // Check OTP expiration
        const now = new Date();
        if (!user.otpExpires || now > user.otpExpires) {
            return next(new AppError("OTP has expired", 400));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return AppResponse(res, "Password reset successfully", 200, null);
    }
);

export const changePasswordHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { currentPassword, newPassword } = req.body;
        const userId = (req.user as IUser)._id;

        // console.log("Change Password Request:", { userId, currentPassword, newPassword });
        

        // Find user
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(new AppError("Current password is incorrect", 401));
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return AppResponse(res, "Password changed successfully", 200, null);
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
                        subject: "Welcome to connectED!",
                        templateName: "welcome",
                        context: { name: findUser.name || "User" }, // Use name if available
                    }).catch((error: Error) =>
                        console.error("Failed to send welcome email:", error)
                    );

                    // Send push notification
                    // if (findUser.fcm_token) {
                    //     const message: admin.messaging.Message = {
                    //         notification: {
                    //             title: "Welcome to Arennah!",
                    //             body: "Thank you for joining us!",
                    //         },
                    //         token: findUser.fcm_token,
                    //     };
                    //     await admin.messaging().send(message).catch((error: Error) =>
                    //         console.error("Failed to send push notification:", error)
                    //     );
                    // }

                    //remove password from the user object
                    findUser.password = undefined;

                    const account = {
                        id: findUser._id,
                        username: findUser.username,
                        name: findUser.name,
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




//Completed

export const logOutHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        //If Web
        res.clearCookie("e_access_token");
        res.clearCookie("e_refresh_token");
        //If mobile, just tell them to delete on their storage
        //   await addTokenToBlacklist(token);
        return AppResponse(res, "User has Log out successfully", 200, null);
    }
);
export const refreshAccessTokenHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {


        if (!req.headers.authorization) {
            return next(new AppError("No authorization header provided", 401));
        }
        const refreshToken = req.headers.authorization.split(" ")[1];

        if (!refreshToken) return next(new AppError("No refresh token provided", 401));
        jwt.verify(
            refreshToken,
            RefreshToken_Secret_Key as string,
            async (err: any, decoded: any) => {
                if (err)
                    return next(
                        new AppError(
                            "Incorrect or expired refresh token, please log in.",
                            401
                        )
                    );

                const id = decoded.payload.id;
                const findUser = await User.findById(id).select("-password");

                if (!findUser)
                    return next(
                        new AppError(
                            "Access token not created, only users can create them.",
                            400
                        )
                    );
                const account = {
                    id: findUser._id,
                    name: findUser.name,
                    email: findUser.email,
                    role: findUser.role,
                };
                const accessToken: string | undefined = GenerateAccessToken(account);

                return AppResponse(res, "Token refreshed succesfully.", 200, {
                    token: accessToken,
                    account,
                });
            }
        );
    }
);

//Completed
export const GetTokenDetailsHandler = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Logic for refreshing the access Token goes here
        const id = (req.user as IUser).id;
        const findUser = await User.findById(id);

        if (!findUser)
            return next(new AppError("Invalid user, please go off.", 400));
        const account = {
            id: findUser._id,
            name: findUser.name,
            email: findUser.email,
            role: findUser.role,
        };
        return AppResponse(res, "Successfully verified the token", 200, account);
    }
);
