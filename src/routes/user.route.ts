import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { getUserProfile } from "../controllers/user.controller";

const router = express.Router();

router.get("/profile", VerifyAccessToken, getUserProfile);






export default router;