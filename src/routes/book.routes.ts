import express from "express";
import VerifyAccessToken, {
  VerifyTrackingToken,
} from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { createBook, borrowBook, returnBook, getUserBorrowedBooks, getAllBooks, getSpecificBook, updateBook, deleteBook } from "../controllers/book.controllers";
import CheckRole from "../middleware/checkRole";

const router = express.Router();

// Route to create a new book

router.post(
  "/create-book",
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  createBook
);

// Route to get all books


// Borrowed books
router.post('/borrow-book', VerifyAccessToken, borrowBook);

// router.post('/borrow', VerifyAccessToken, CheckRole(['member']), borrowBook)



export default router;
