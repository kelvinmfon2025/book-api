// models/Reservation.ts
import { Schema, model } from 'mongoose';
import { Reservation } from '../interfaces/reservation.interface';

const reservationSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'canceled', 'fulfilled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
});

export default model('Reservation', reservationSchema);