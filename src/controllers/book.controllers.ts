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
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const returnBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const getUserBorrowedBooks = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
