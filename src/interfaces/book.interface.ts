import { Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  authors: string[];
  isbn: string;
  publisher?: string;
  publicationYear?: number;
  genres: string[];
  language?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string; // e.g., shelf or section
  description?: string;
  coverImage?: string; // URL or file path
  createdAt: Date;
  updatedAt: Date;
}