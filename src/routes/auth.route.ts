import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken, { VerifyTrackingToken } from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { registerSchema } from "../validations/authValidation";
import { registerHandler, loginHandler } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", Limiter, validate(registerSchema), registerHandler);
router.post("/login", Limiter, validate(registerSchema), loginHandler);







export default router;