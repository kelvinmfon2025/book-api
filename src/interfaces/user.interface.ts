import mongoose, { Document} from 'mongoose';

export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: 'member' | 'librarian' | 'admin';
  borrowedBooks: Array<{
    bookId: mongoose.Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}