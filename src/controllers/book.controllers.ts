import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import AppError from "../errors/AppError";
import { IUser } from "../interfaces/user.interface";
import { BookModel } from "../model/book.model";
import { User } from "../model/user.model";
import { logger } from "handlebars";

// This controller handles  books
export const createBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        authors,
        isbn,
        publisher,
        publicationYear,
        genres,
        language,
        totalCopies,
        availableCopies,
        location,
        description,
        coverImage,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !authors ||
        !isbn ||
        !genres ||
        !totalCopies ||
        availableCopies === undefined
      ) {
        return next(new AppError("Missing required fields", 400));
      }

      const newBook = new BookModel({
        title,
        authors,
        isbn,
        publisher,
        publicationYear,
        genres,
        language,
        totalCopies,
        availableCopies,
        location,
        description,
        coverImage,
      });

      await newBook.save();

      return AppResponse(res, "Book created successfully", 201, newBook);
    } catch (error) {
      console.error("Error creating book:", error);
      return next(new AppError("Failed to create book", 500));
    }
  }
);

export const getAllBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const books = await BookModel.find()
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalBooks = await BookModel.countDocuments();

      return AppResponse(
        res,
        "Books retrieved successfully",
        200,
        {
          books,
          total: totalBooks,
          page: Number(page),
          limit: Number(limit),
        }
      );
    } catch (error) {
      console.error("Error retrieving books:", error);
      return next(new AppError("Failed to retrieve books", 500));
    }
  }
);

export const getSpecificBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const book = await BookModel.findById(id);
      if (!book) {
        return next(new AppError("Book not found", 404));
      
      }


      return AppResponse(res, "Book retrieved successfully", 200, book);
    } catch (error) {
      console.error("Error retrieving book:", error);
      return next(new AppError("Failed to retrieve book", 500));
    }
  }
);

export const updateBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const book = await BookModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!book) {
        return next(new AppError("Book not found", 404));
      }

      return AppResponse(res, "Book updated successfully", 200, book);
    } catch (error) {
      console.error("Error updating book:", error);
      return next(new AppError("Failed to update book", 500));
    }
  }
);

export const deleteBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const book = await BookModel.findByIdAndDelete(id);
      if (!book) {
        return next(new AppError("Book not found", 404));
      }

      return AppResponse(res, "Book deleted successfully", 200, book);
    } catch (error) {
      console.error("Error deleting book:", error);
      return next(new AppError("Failed to delete book", 500));
    }
  }
);

//KAZEEM

//         Sprint 3: Borrowing System Endpoints
// POST /api/borrow - Borrow a book (member only, updates User.borrowedBooks and Book.availableCopies).

// POST /api/return/:borrowId - Return a borrowed book (member only, updates User.borrowedBooks and Book.availableCopies).

// GET /api/users/:id/borrowed - Get a user’s borrowed books (authenticated user for their own books, admin/librarian for any user).

export const borrowBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { bookId } = req.body;
    if (!bookId) {
      return next(new AppError("Book ID is required", 400));
    }
    const book = await BookModel.findById(bookId);
    if (!book) {
      return next(new AppError("Book not found", 404));
    }
    if (book.availableCopies <= 0) {
      return next(new AppError("No available copies of this book", 400));
    }
    if (user.borrowedBooks.length >= 5) {
      return next(new AppError("You can only borrow up to 5 books", 400));
    }
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14); // Set due date  
    user.borrowedBooks.push({
      bookId: book._id as import("mongoose").Types.ObjectId,
      borrowDate,
      dueDate,
    });
    book.availableCopies -= 1;
    await user.save();
    await book.save();
    return AppResponse(
      res,
      "Book borrowed successfully",
      200,
      {
        bookId: book._id,
        borrowDate,
        dueDate,
      }
    );  
  }
);

export const returnBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
  }
);

export const getUserBorrowedBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);







//KELVIN 
//THIS IS WHERE I STARTED WRITING FROM
//I have done this it just remain to test it in postman

export const searchBookByQuery = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { query, page = "1", limit = "10" } = req.query;

    // Ensure query is a valid string
    if (typeof query !== "string" || query.trim() === "") {
      return next(new AppError("Search query is required", 400));
    }

    const searchRegex = new RegExp(query.trim(), "i");

    // Pagination values
    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const limitNumber = Math.max(parseInt(limit as string, 10), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Define search condition
    const searchCondition = {
      $or: [
        { title: searchRegex },
        { authors: searchRegex },
        { genres: searchRegex },
        { isbn: searchRegex },
      ],
    };

    // Perform search with pagination
    const [books, total] = await Promise.all([
      BookModel.find(searchCondition).skip(skip).limit(limitNumber),
      BookModel.countDocuments(searchCondition),
    ]);

    if (books.length === 0) {
      return next(new AppError("No books found matching your query", 404));
    }

    return AppResponse(res, "Books retrieved successfully", 200, {
      total,
      page: pageNumber,
      limit: limitNumber,
      results: books,
    });
  }
);






