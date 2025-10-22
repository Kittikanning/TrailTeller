import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getBookingsByTrip,
  createBooking,
  updateBooking,
  deleteBooking
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/trip/:tripId', protect, getBookingsByTrip);

router.route('/')
  .post(protect, createBooking);

router.route('/:id')
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;