import mongoose, { Document} from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  bio?: string;
  role: 'member' | 'librarian' | 'admin';
  borrowedBooks: Array<{
    bookId: mongoose.Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;

  }>;
  isEmailVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}