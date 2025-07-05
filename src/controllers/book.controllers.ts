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
      const books = await BookModel.find();
      return AppResponse(res, "Books fetched successfully", 200, books);
    } catch (error) {
      console.error("Error fetching books:", error);
      return next(new AppError("Failed to fetch books", 500));
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

      return AppResponse(res, "Book fetched successfully", 200, book);
    } catch (error) {
      console.error("Error fetching book:", error);
      return next(new AppError("Failed to fetch book", 500));
    }
  }
);

export const updateBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const updateData = req.body;


      console.log("Update book ID:", id);
      console.log("Update book data:", updateData);

      const book = await BookModel.findByIdAndUpdate(
        id, updateData, { new: true, runValidators: true,});

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
      const { id } = req.params as { id: string };
      const deletedBook = await BookModel.findByIdAndDelete(id);

      if (!deletedBook) {
        return next(new AppError("Book not found", 404));
      }

      return AppResponse(res, "Book deleted successfully", 200, deletedBook);
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
