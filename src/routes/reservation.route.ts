import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { verify } from "crypto";
import CheckRole from "../middleware/checkRole";
import { getAllReservations, reserveBook } from "../controllers/reservation.controller";

const router = express.Router();

router.post("/reserve/:bookId", VerifyAccessToken, reserveBook);


router.get("/reservations", VerifyAccessToken, CheckRole(["admin", "librarian"]), Limiter, getAllReservations);

export default router;