import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { verify } from "crypto";
import CheckRole from "../middleware/checkRole";
import { reserveBook } from "../controllers/reservation.controller";

const router = express.Router();

router.post("/reserve/:id", VerifyAccessToken, reserveBook);

export default router;