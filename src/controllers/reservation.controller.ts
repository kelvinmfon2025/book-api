import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import AppError from "../errors/AppError";
import { Reservation } from "../interfaces/reservation.interface";
import ReservationModel from "../model/reservation.model";
import { BookModel } from "../model/book.model";




export const reserveBook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { bookId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated.',
      });
    }

    const userId = req.user.id;

    // Check if the book exists
    const book = await BookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: 'fail',
        message: 'Book not found',
      });
    }

    // Optional: Check if book is already available (no need to reserve)
    if (book.availableCopies > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Book is currently available. No need to reserve.',
      });
    }

    // Check for existing active reservation
    const existingReservation = await ReservationModel.findOne({
      book: bookId,
      user: userId,
      fulfilled: false,
    });

    if (existingReservation) {
      return res.status(400).json({
        status: 'fail',
        message: 'You already have an active reservation for this book.',
      });
    }

    // Create new reservation
    const reservation = await ReservationModel.create({
      book: bookId,
      user: userId,
      reservedAt: new Date(),
      fulfilled: false,
    });

    res.status(201).json({
      status: 'success',
      data: {
        reservation,
      },
    });
  }
);


