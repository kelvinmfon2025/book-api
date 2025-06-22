"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateZod_1 = __importDefault(require("../middleware/validateZod"));
const rateLimit_1 = __importDefault(require("../middleware/rateLimit"));
const authValidation_1 = require("../validations/authValidation");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post("/register", rateLimit_1.default, (0, validateZod_1.default)(authValidation_1.registerSchema), auth_controller_1.registerHandler);
exports.default = router;
