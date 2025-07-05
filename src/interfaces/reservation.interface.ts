import mongoose, { Document} from 'mongoose';


export interface Reservation extends Document {
  availableCopies: number;
  _id: string;
  bookId: string;
  userId: string;
  status: 'active' | 'canceled' | 'fulfilled';
  createdAt: Date;
  expiresAt?: Date;
}