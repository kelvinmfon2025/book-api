import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken, { VerifyTrackingToken } from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { loginSchema, registerSchema, verifyEmailOtpSchema } from "../validations/authValidation";
import { registerHandler, loginHandler, verifyEmailHandler  } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", Limiter, validate(registerSchema), registerHandler);

router.post('/verify-email', validate(verifyEmailOtpSchema), verifyEmailHandler)

router.patch("/login", Limiter, validate(loginSchema), loginHandler);

// router.logout()







export default router;