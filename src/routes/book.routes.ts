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

router.get('/books', VerifyAccessToken, getAllBooks);
// Borrowed books

router.post('/borrow', VerifyAccessToken, borrowBook);

//Get specific book 

router . get('/books/:id',VerifyAccessToken, getSpecificBook);

// Update book

router . patch('/books/:id', VerifyAccessToken, CheckRole(["admin", "Librarian"]), updateBook);

// Delete book

router.delete('/books/:id', VerifyAccessToken, CheckRole(["admin", "librarian"]), deleteBook);



export default router;
