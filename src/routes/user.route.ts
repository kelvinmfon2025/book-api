import express from "express";
import validate from "../middleware/validateZod";
import VerifyAccessToken from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { getUserProfile, updateUserById } from "../controllers/user.controller";
import { updateUserProfile } from "../controllers/user.controller";
import { getUserById } from "../controllers/user.controller";
import { deleteUserById } from "../controllers/user.controller";
import { verify } from "crypto";
import CheckRole from "../middleware/checkRole";

const router = express.Router();

router.get("/profile", VerifyAccessToken, getUserProfile) ;
 
router.put("/update-profile", VerifyAccessToken, updateUserProfile)

router.get("/get-user-id/:id", VerifyAccessToken,  CheckRole(["admin", "librarian"], "somePermission"), getUserById)

router.put("/update-user-id/:id", VerifyAccessToken, updateUserById);

router.delete("/delete-user-id/:id", VerifyAccessToken, deleteUserById);




export default router;