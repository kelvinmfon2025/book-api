"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAccessToken_1 = __importDefault(require("../middleware/verifyAccessToken"));
const book_controllers_1 = require("../controllers/book.controllers");
const checkRole_1 = __importDefault(require("../middleware/checkRole"));
const router = express_1.default.Router();
// Route to create a new book
router.post("/create-book", verifyAccessToken_1.default, (0, checkRole_1.default)(["admin", "librarian"]), book_controllers_1.createBook);
// Route to get all books
// Borrowed books
router.post('/borrow', verifyAccessToken_1.default, book_controllers_1.borrowBook);
exports.default = router;
