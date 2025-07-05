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

// Route to get all books with pagination
router.get(
  "/",
  Limiter,
  getAllBooks
);
// Route to get a specific book by ID
router.get(
  "/:id",
  Limiter,
  VerifyAccessToken,
  getSpecificBook
);
// Route to update a book by ID
router.patch(
  "/:id",
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  updateBook
);
// Route to delete a book by ID
router.delete(
  "/:id",
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  deleteBook
);

export default router;
