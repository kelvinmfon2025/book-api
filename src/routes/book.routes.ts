import express from "express";
import VerifyAccessToken, {
  VerifyTrackingToken,
} from "../middleware/verifyAccessToken";
import Limiter from "../middleware/rateLimit";
import { createBook, borrowBook, returnBook, searchBookByQuery, getUserBorrowedBooks, getAllBooks, getSpecificBook, updateBook, deleteBook } from "../controllers/book.controllers";
import CheckRole from "../middleware/checkRole";

const router = express.Router();

// Route to create a new book

router.post(
  "/create-book",
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  createBook
);

// Route to get all books\

router.get(
  "/all-books",
  VerifyAccessToken,
  Limiter,
  getAllBooks
);

// Route to get a specific book by ID
router.get(
  "/book/:id",
  VerifyAccessToken,
  getSpecificBook
);

// update book
router.put(
  "/update-book/:id", 
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  updateBook
);


// delete book
router.delete(
  "/delete-book/:id", 
  VerifyAccessToken,
  CheckRole(["admin", "librarian"]),
  deleteBook
);


// Borrowed books
router.post('/borrow-book', VerifyAccessToken, borrowBook);

// router.post('/borrow', VerifyAccessToken, CheckRole(['member']), borrowBook)


router.get("/search-by-query" , VerifyAccessToken, searchBookByQuery);


// Return book
router.post(
  "/return/:borrowId",
  VerifyAccessToken,
  CheckRole(["member"]),
  returnBook
);


// Add this route to your existing routes in book.routes.ts

// Route to get user's borrowed books
router.get(
  "/users/:id/borrowed",
  VerifyAccessToken,
  getUserBorrowedBooks
);


export default router;
