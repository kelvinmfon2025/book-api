import mongoose, { Schema } from 'mongoose';
import { IBook } from '../interfaces/book.interface';

const bookSchema: Schema<IBook> = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true, // Index for faster search
    },
    authors: {
      type: [String],
      required: [true, 'At least one author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits'],
    },
    publisher: {
      type: String,
      trim: true,
    },
    publicationYear: {
      type: Number,
      min: [1450, 'Publication year must be after 1450'],
      max: [new Date().getFullYear(), 'Publication year cannot be in the future'],
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'At least one copy is required'],
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: function (this: IBook, value: number) {
          return value <= this.totalCopies;
        },
        message: 'Available copies cannot exceed total copies',
      },
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverImage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export const BookModel = mongoose.model<IBook>('Book', bookSchema);